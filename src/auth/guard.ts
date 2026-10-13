import "server-only";

import { redirect } from "next/navigation";
import type { UserRole } from "@/domain/schemas";
import type { ModuleKey } from "@/modules/keys";
import { readModuleState } from "@/modules/store";
import { ROLE_CUENTAHABIENTE } from "./constants";
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

export async function requireModule(key: ModuleKey): Promise<VerifiedSession> {
  const session = await requireRole(ROLE_CUENTAHABIENTE);
  if (!(await moduleEnabled(session.userId, key))) {
    redirect("/");
  }
  return session;
}

export async function moduleEnabled(userId: string, key: ModuleKey): Promise<boolean> {
  try {
    return (await readModuleState(userId))[key];
  } catch (error) {
    console.error("[praxis] módulos", error instanceof Error ? error.message : "error");
    return false;
  }
}
