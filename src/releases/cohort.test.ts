import { describe, expect, test } from "bun:test";
import {
  effectivePercent,
  eligibleHolderCount,
  isReleaseCandidate,
  releaseBucket,
} from "./cohort";

const now = new Date("2026-10-09T12:00:00.000Z");
const releaseId = "build-1";

describe("releaseBucket", () => {
  test("el cubo es estable y cae entre 0 y 99", () => {
    const bucket = releaseBucket(releaseId, "sofia");
    expect(bucket).toBeGreaterThanOrEqual(0);
    expect(bucket).toBeLessThan(100);
    expect(releaseBucket(releaseId, "sofia")).toBe(bucket);
  });
});

describe("effectivePercent", () => {
  test("un escalón futuro no cuenta y uno vencido no baja el suelo manual", () => {
    expect(
      effectivePercent(0, [{ at: new Date("2026-10-10T12:00:00.000Z"), percent: 40 }], now),
    ).toBe(0);
    expect(
      effectivePercent(10, [{ at: new Date("2026-10-09T11:00:00.000Z"), percent: 40 }], now),
    ).toBe(40);
    expect(
      effectivePercent(50, [{ at: new Date("2026-10-09T11:00:00.000Z"), percent: 40 }], now),
    ).toBe(50);
  });
});

describe("isReleaseCandidate", () => {
  test("el administrador siempre es candidato", () => {
    expect(
      isReleaseCandidate({
        role: "administrador",
        userId: "admin",
        releaseId,
        percent: 0,
        steps: [],
        allowUserIds: [],
        now,
      }),
    ).toBe(true);
  });

  test("la lista incluye aunque el porcentaje sea 0", () => {
    expect(
      isReleaseCandidate({
        role: "cuentahabiente",
        userId: "sofia",
        releaseId,
        percent: 0,
        steps: [],
        allowUserIds: ["sofia"],
        now,
      }),
    ).toBe(true);
    expect(
      isReleaseCandidate({
        role: "cuentahabiente",
        userId: "diego",
        releaseId,
        percent: 0,
        steps: [],
        allowUserIds: ["sofia"],
        now,
      }),
    ).toBe(false);
  });

  test("subir el porcentaje conserva a quien ya entraba", () => {
    const userId = "valeria";
    const bucket = releaseBucket(releaseId, userId);
    const policy = {
      role: "cuentahabiente" as const,
      userId,
      releaseId,
      steps: [],
      allowUserIds: [],
      now,
    };
    expect(isReleaseCandidate({ ...policy, percent: bucket })).toBe(false);
    expect(isReleaseCandidate({ ...policy, percent: bucket + 1 })).toBe(true);
    expect(isReleaseCandidate({ ...policy, percent: 100 })).toBe(true);
  });

  test("el conteo solo mira cuentahabientes", () => {
    const ids = ["a", "b"];
    expect(
      eligibleHolderCount(
        ids,
        { releaseId, percent: 100, steps: [], allowUserIds: [] },
        now,
      ),
    ).toBe(2);
    expect(
      eligibleHolderCount(
        ids,
        { releaseId, percent: 0, steps: [], allowUserIds: ["a"] },
        now,
      ),
    ).toBe(1);
  });
});
