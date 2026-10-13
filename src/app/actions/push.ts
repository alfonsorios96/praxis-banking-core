"use server";

import { ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { requireRole } from "@/auth/guard";
import { deviceTokenSchema } from "@/notifications/token";
import { saveDeviceToken } from "@/notifications/tokens";

export async function registerDeviceToken(token: string): Promise<{ ok: boolean }> {
  const session = await requireRole(ROLE_CUENTAHABIENTE);
  const parsed = deviceTokenSchema.safeParse(token);
  if (!parsed.success) {
    return { ok: false };
  }

  try {
    await saveDeviceToken(session.userId, parsed.data);
  } catch (error) {
    console.error("[praxis] push", error instanceof Error ? error.message : "error");
    return { ok: false };
  }

  return { ok: true };
}
