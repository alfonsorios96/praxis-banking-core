import { formatEur } from "@/domain/money";
import { TRANSFER_PUSH_PATH, TRANSFER_PUSH_TITLE } from "./constants";

const FALLBACK_SENDER = "Otro cuentahabiente";

export function shouldNotifyRecipient(result: { ok: boolean; duplicate?: boolean }): boolean {
  return result.ok && result.duplicate !== true;
}

export function visibleSenderLabel(
  person: { fullName?: unknown; username?: unknown } | null,
  fallback: string,
): string {
  const fullName = typeof person?.fullName === "string" ? person.fullName.trim() : "";
  if (fullName) {
    return fullName;
  }
  const username = typeof person?.username === "string" ? person.username.trim() : "";
  if (username) {
    return username;
  }
  const trimmed = fallback.trim();
  return trimmed || FALLBACK_SENDER;
}

export function transferPushBody(amountMinor: number, senderLabel: string): string {
  const label = senderLabel.trim() || FALLBACK_SENDER;
  return `${formatEur(amountMinor)} de ${label}`;
}

export function transferPushData(input: {
  amountMinor: number;
  senderLabel: string;
}): Record<string, string> {
  return {
    title: TRANSFER_PUSH_TITLE,
    body: transferPushBody(input.amountMinor, input.senderLabel),
    url: TRANSFER_PUSH_PATH,
  };
}
