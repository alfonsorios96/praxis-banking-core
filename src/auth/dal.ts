import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { SESSION_COOKIE, USER_ROLE } from "./constants";
import { decryptSession } from "./token";

export type VerifiedSession = {
  userId: string;
  username: string;
  role: typeof USER_ROLE;
};

export const verifySession = cache(async (): Promise<VerifiedSession | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = await decryptSession(token);

  if (!payload) {
    return null;
  }

  return {
    userId: payload.userId,
    username: payload.username,
    role: USER_ROLE,
  };
});
