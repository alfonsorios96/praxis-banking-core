"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ROLE_ADMINISTRADOR } from "@/auth/constants";
import { verifySession } from "@/auth/dal";
import { connectDb } from "@/db/connect";
import {
  PLATFORM_SETTINGS_KEY,
  PlatformSettings,
} from "@/db/models/platform-settings";

const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Usa al menos 2 caracteres.")
  .max(40, "Máximo 40 caracteres.");

export type PlatformFormState = {
  message?: string;
  error?: string;
};

export async function updatePlatformName(
  _state: PlatformFormState | undefined,
  formData: FormData,
): Promise<PlatformFormState> {
  const session = await verifySession();
  if (!session || session.role !== ROLE_ADMINISTRADOR) {
    return { error: "Solo un administrador puede configurar la plataforma." };
  }

  const parsed = displayNameSchema.safeParse(formData.get("displayName"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nombre no válido." };
  }

  try {
    await connectDb();
    await PlatformSettings.updateOne(
      { key: PLATFORM_SETTINGS_KEY },
      {
        $set: { displayName: parsed.data },
        $setOnInsert: { key: PLATFORM_SETTINGS_KEY },
      },
      { upsert: true },
    );
  } catch (error) {
    console.error(error);
    return { error: "No se pudo guardar. Revisa la conexión a MongoDB." };
  }

  revalidatePath("/", "layout");
  return { message: "Nombre actualizado." };
}
