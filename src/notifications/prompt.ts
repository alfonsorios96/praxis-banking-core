export function shouldOfferPushPrompt(
  permission: "default" | "granted" | "denied" | "hidden",
  seen: boolean,
): boolean {
  return permission === "default" && !seen;
}
