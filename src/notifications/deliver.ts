import type { FirebaseAdminCredentials } from "./credentials";

const STALE_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

export type PushSend = (token: string, data: Record<string, string>) => Promise<void>;

export type PushForget = (token: string) => Promise<void>;

export function isStaleDeviceToken(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }
  return typeof error.code === "string" && STALE_TOKEN_CODES.has(error.code);
}

export async function deliverTransferPush(input: {
  credentials: FirebaseAdminCredentials | null;
  tokens: string[];
  data: Record<string, string>;
  send: PushSend;
  forget: PushForget;
}): Promise<{ sent: number; forgotten: string[] }> {
  if (!input.credentials || input.tokens.length === 0) {
    return { sent: 0, forgotten: [] };
  }

  let sent = 0;
  const forgotten: string[] = [];

  for (const token of input.tokens) {
    try {
      await input.send(token, input.data);
      sent += 1;
    } catch (error) {
      if (!isStaleDeviceToken(error)) {
        console.error("[praxis] push", errorCode(error));
        continue;
      }
      forgotten.push(token);
      try {
        await input.forget(token);
      } catch (forgetError) {
        console.error("[praxis] push", errorCode(forgetError));
      }
    }
  }

  return { sent, forgotten };
}

function errorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
    return error.code;
  }
  return "error";
}
