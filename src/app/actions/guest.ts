"use server";

import { redirect } from "next/navigation";
import { ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { createSession } from "@/auth/session";
import { createGuest } from "@/identity/create-guest";
import { type GuestFormState, guestNameSchema } from "@/identity/guest";

export async function enterAsGuest(
  _state: GuestFormState,
  formData: FormData,
): Promise<GuestFormState> {
  const raw = formData.get("name");
  const name = typeof raw === "string" ? raw : "";
  const parsed = guestNameSchema.safeParse({ name });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, name };
  }

  try {
    const guest = await createGuest(parsed.data.name);
    await createSession({
      userId: guest.userId,
      username: guest.username,
      role: ROLE_CUENTAHABIENTE,
    });
  } catch (error) {
    console.error(error);
    return { message: "No se pudo crear el invitado. Revisa la conexión a MongoDB.", name };
  }

  redirect("/");
}
