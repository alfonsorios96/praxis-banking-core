import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_DURATION_MS } from "./constants";
import { encryptSession, type SessionPayload } from "./token";

export async function createSession(
  payload: Omit<SessionPayload, "expiresAt">,
): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await encryptSession({
    ...payload,
    expiresAt: expiresAt.toISOString(),
  });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
