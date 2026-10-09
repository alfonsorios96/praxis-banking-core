import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import type { UserRole } from "@/domain/schemas";
import { SESSION_COOKIE } from "./constants";
import { decryptSession } from "./token";

export type VerifiedSession = {
  userId: string;
  username: string;
  role: UserRole;
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
    role: payload.role,
  };
});
