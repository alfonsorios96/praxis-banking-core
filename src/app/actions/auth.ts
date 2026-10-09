"use server";

import { redirect } from "next/navigation";
import { USER_ROLE } from "@/auth/constants";
import { type LoginFormState, loginSchema, safeNextPath } from "@/auth/login-schema";
import { verifyPassword } from "@/auth/password";
import { createSession, deleteSession } from "@/auth/session";
import { connectDb } from "@/db/connect";
import { User } from "@/db/models/user";

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
  const nextPath = safeNextPath(formData.get("from"));

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

    await createSession({
      userId: user._id.toString(),
      username: user.username,
      role: USER_ROLE,
    });
  } catch (error) {
    console.error(error);
    return { message: "No se pudo iniciar sesión. Revisa la conexión a MongoDB." };
  }

  redirect(nextPath);
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
