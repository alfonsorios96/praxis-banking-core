import type { UserRole } from "@/domain/schemas";
import { Release } from "@/db/models/release";
import { currentBuildId } from "./build-id";
import { isReleaseCandidate, type ReleaseStep } from "./cohort";

export type StoredRelease = {
  buildId: string;
  label: string;
  percent: number;
  allowUserIds: string[];
  steps: ReleaseStep[];
};

export async function ensureCurrentRelease(): Promise<string> {
  const buildId = currentBuildId();
  await Release.updateOne(
    { buildId },
    {
      $setOnInsert: {
        buildId,
        label: buildId,
        percent: 0,
        allowUserIds: [],
        steps: [],
      },
    },
    { upsert: true },
  );
  return buildId;
}

export async function readCurrentRelease(): Promise<StoredRelease | null> {
  const buildId = currentBuildId();
  const doc = await Release.findOne({ buildId }).lean();
  if (!doc || typeof doc.buildId !== "string") {
    return null;
  }
  const steps = Array.isArray(doc.steps)
    ? doc.steps.flatMap((step) => {
        const at = step?.at instanceof Date ? step.at : new Date(step?.at);
        const percent = step?.percent;
        if (Number.isNaN(at.getTime()) || typeof percent !== "number") {
          return [];
        }
        return [{ at, percent }];
      })
    : [];
  return {
    buildId: doc.buildId,
    label: typeof doc.label === "string" ? doc.label : doc.buildId,
    percent: typeof doc.percent === "number" ? doc.percent : 0,
    allowUserIds: Array.isArray(doc.allowUserIds)
      ? doc.allowUserIds.filter((id): id is string => typeof id === "string")
      : [],
    steps,
  };
}

export function candidateFor(
  release: StoredRelease,
  input: { role: UserRole; userId: string; now: Date },
): boolean {
  return isReleaseCandidate({
    role: input.role,
    userId: input.userId,
    releaseId: release.buildId,
    percent: release.percent,
    steps: release.steps,
    allowUserIds: release.allowUserIds,
    now: input.now,
  });
}
