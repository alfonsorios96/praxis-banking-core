import { USER_ROLE } from "@/auth/constants";
import { hashPassword } from "@/auth/password";
import { User } from "./models/user";

export async function seedDefaultUser(): Promise<void> {
  const count = await User.countDocuments();
  if (count > 0) {
    return;
  }

  const username = process.env.AUTH_SEED_USERNAME?.trim().toLowerCase();
  const password = process.env.AUTH_SEED_PASSWORD;

  if (!username || !password) {
    console.warn(
      "[praxis] users está vacía. Define AUTH_SEED_USERNAME y AUTH_SEED_PASSWORD para crear el usuario por defecto.",
    );
    return;
  }

  await User.create({
    username,
    fullName: "",
    passwordHash: await hashPassword(password),
    role: USER_ROLE,
  });
}
