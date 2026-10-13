export const RELEASE_PROMPT_SEEN_PREFIX = "praxis.releasePromptSeen.";

export function releasePromptStorageKey(buildId: string): string {
  return `${RELEASE_PROMPT_SEEN_PREFIX}${buildId}`;
}

export function shouldShowReleasePrompt(seen: boolean): boolean {
  return !seen;
}
