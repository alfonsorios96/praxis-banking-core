import { describe, expect, test } from "bun:test";
import { releasePromptStorageKey, shouldShowReleasePrompt } from "./prompt";

describe("aviso de versión", () => {
  test("se muestra solo si esta build aún no se ha visto", () => {
    expect(shouldShowReleasePrompt(false)).toBe(true);
    expect(shouldShowReleasePrompt(true)).toBe(false);
    expect(releasePromptStorageKey("build-1")).toBe("praxis.releasePromptSeen.build-1");
  });
});
