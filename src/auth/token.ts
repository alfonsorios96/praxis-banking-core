import { jwtVerify, SignJWT } from "jose";
import { USER_ROLE } from "./constants";

export type SessionPayload = {
  userId: string;
  username: string;
  role: typeof USER_ROLE;
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
    if (
      typeof payload.userId !== "string" ||
      typeof payload.username !== "string" ||
      payload.role !== USER_ROLE
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      username: payload.username,
      role: USER_ROLE,
      expiresAt: String(payload.expiresAt ?? ""),
    };
  } catch {
    return null;
  }
}
