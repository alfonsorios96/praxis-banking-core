import "server-only";

import { redirect } from "next/navigation";
import type { UserRole } from "@/domain/schemas";
import { verifySession, type VerifiedSession } from "./dal";

export async function requireRole(role: UserRole): Promise<VerifiedSession> {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== role) {
    redirect("/");
  }
  return session;
}
