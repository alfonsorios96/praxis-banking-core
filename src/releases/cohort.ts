import { createHash } from "node:crypto";
import { ROLE_ADMINISTRADOR, ROLE_CUENTAHABIENTE } from "@/auth/constants";
import type { UserRole } from "@/domain/schemas";

export type ReleaseStep = {
  at: Date;
  percent: number;
};

export type ReleasePolicy = {
  releaseId: string;
  percent: number;
  steps: readonly ReleaseStep[];
  allowUserIds: readonly string[];
};

export function releaseBucket(releaseId: string, userId: string): number {
  const digest = createHash("sha256").update(`${releaseId}:${userId}`).digest();
  return digest.readUInt16BE(0) % 100;
}

export function effectivePercent(
  percent: number,
  steps: readonly ReleaseStep[],
  now: Date,
): number {
  let value = percent;
  for (const step of steps) {
    if (step.at.getTime() <= now.getTime()) {
      value = Math.max(value, step.percent);
    }
  }
  return value;
}

export function isReleaseCandidate(
  input: ReleasePolicy & {
    role: UserRole;
    userId: string;
    now: Date;
  },
): boolean {
  if (input.role === ROLE_ADMINISTRADOR) {
    return true;
  }
  if (input.allowUserIds.includes(input.userId)) {
    return true;
  }
  if (input.role !== ROLE_CUENTAHABIENTE) {
    return false;
  }
  const percent = effectivePercent(input.percent, input.steps, input.now);
  return releaseBucket(input.releaseId, input.userId) < percent;
}

export function eligibleHolderCount(
  userIds: readonly string[],
  policy: ReleasePolicy,
  now: Date,
): number {
  return userIds.filter((userId) =>
    isReleaseCandidate({
      ...policy,
      role: ROLE_CUENTAHABIENTE,
      userId,
      now,
    }),
  ).length;
}
