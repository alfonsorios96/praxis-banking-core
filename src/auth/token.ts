import { jwtVerify, SignJWT } from "jose";
import { userRoleSchema, type UserRole } from "@/domain/schemas";

export type SessionPayload = {
  userId: string;
  username: string;
  role: UserRole;
  expiresAt: string;
};

function encodedSecret(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    return null;
  }
  return new TextEncoder().encode(secret);
}

export async function encryptSession(payload: SessionPayload): Promise<string> {
  const secret = encodedSecret();
  if (!secret) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters.");
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function decryptSession(
  session: string | undefined,
): Promise<SessionPayload | null> {
  const secret = encodedSecret();
  if (!session || !secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(session, secret, {
      algorithms: ["HS256"],
    });
    const role = userRoleSchema.safeParse(payload.role);
    if (
      typeof payload.userId !== "string" ||
      typeof payload.username !== "string" ||
      !role.success
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      username: payload.username,
      role: role.data,
      expiresAt: String(payload.expiresAt ?? ""),
    };
  } catch {
    return null;
  }
}
