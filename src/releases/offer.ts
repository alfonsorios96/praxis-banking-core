import "server-only";

import { cookies } from "next/headers";
import type { VerifiedSession } from "@/auth/dal";
import { connectDb } from "@/db/connect";
import { RELEASE_COOKIE } from "./constants";
import { candidateFor, readCurrentRelease } from "./store";

export async function releaseOfferFor(session: VerifiedSession): Promise<string | null> {
  await connectDb();
  const release = await readCurrentRelease();
  if (!release) {
    return null;
  }
  const candidate = candidateFor(release, {
    role: session.role,
    userId: session.userId,
    now: new Date(),
  });
  if (!candidate) {
    return null;
  }
  const accepted = (await cookies()).get(RELEASE_COOKIE)?.value;
  if (accepted === release.buildId) {
    return null;
  }
  return release.buildId;
}
