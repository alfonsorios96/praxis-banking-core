"use server";

import { redirect } from "next/navigation";
import { landingPath } from "@/auth/access";
import { verifySession } from "@/auth/dal";
import { type LoginFormState, loginSchema, safeNextPath } from "@/auth/login-schema";
import { verifyPassword } from "@/auth/password";
import { createSession, deleteSession } from "@/auth/session";
import { connectDb } from "@/db/connect";
import { User } from "@/db/models/user";
import { userRoleSchema } from "@/domain/schemas";
import { removeDeviceToken } from "@/notifications/tokens";

export async function login(
  _state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const username = parsed.data.username.toLowerCase();
  const requested = safeNextPath(formData.get("from"));
  let nextPath = "/";

  try {
    await connectDb();
    const user = await User.findOne({ username }).select("+passwordHash");
    const passwordHash = user?.passwordHash;
    const passwordOk =
      typeof passwordHash === "string" &&
      (await verifyPassword(parsed.data.password, passwordHash));

    if (!user || !passwordOk) {
      return { message: "Usuario o contraseña incorrectos." };
    }

    const role = userRoleSchema.safeParse(user.role);
    if (!role.success) {
      return { message: "Esta cuenta no tiene un rol de acceso válido." };
    }

    await createSession({
      userId: user._id.toString(),
      username: user.username,
      role: role.data,
    });
    nextPath = landingPath(role.data, requested);
  } catch (error) {
    console.error(error);
    return { message: "No se pudo iniciar sesión. Revisa la conexión a MongoDB." };
  }

  redirect(nextPath);
}

export async function logout(formData: FormData): Promise<void> {
  const token = formData instanceof FormData ? String(formData.get("deviceToken") ?? "") : "";
  const session = await verifySession();
  if (session && token) {
    try {
      await removeDeviceToken(session.userId, token);
    } catch (error) {
      console.error("[praxis] push", error instanceof Error ? error.message : "error");
    }
  }
  await deleteSession();
  redirect("/login");
}
