import { ROLE_ADMINISTRADOR, ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { hashPassword } from "@/auth/password";
import type { UserRole } from "@/domain/schemas";
import { isDuplicateKey } from "./duplicate";
import { ensurePlatformSettings } from "./models/platform-settings";
import { User } from "./models/user";
import { SEED_ACCOUNT_HOLDERS, SEED_ADMIN_USERNAME } from "./seed-roster";

export { SEED_ACCOUNT_HOLDERS, SEED_ADMIN_USERNAME };

export async function seedAccess(): Promise<void> {
  const adminUsername =
    process.env.AUTH_SEED_USERNAME?.trim().toLowerCase() || SEED_ADMIN_USERNAME;
  const adminUsernames = [...new Set([SEED_ADMIN_USERNAME, adminUsername])];

  await User.collection.updateMany(
    { username: { $in: adminUsernames } },
    { $set: { role: ROLE_ADMINISTRADOR } },
  );
  await User.collection.updateMany(
    { role: "user", username: { $nin: adminUsernames } },
    { $set: { role: ROLE_CUENTAHABIENTE } },
  );

  await ensurePlatformSettings();

  const password = process.env.AUTH_SEED_PASSWORD;
  if (!password) {
    console.warn(
      "[praxis] Sin AUTH_SEED_PASSWORD no se crean el administrador ni los cuentahabientes que falten.",
    );
    return;
  }

  await ensureUser({
    username: adminUsername,
    fullName: "Administración",
    role: ROLE_ADMINISTRADOR,
    password,
    promote: true,
  });

  if (adminUsername !== SEED_ADMIN_USERNAME) {
    await ensureUser({
      username: SEED_ADMIN_USERNAME,
      fullName: "Administración",
      role: ROLE_ADMINISTRADOR,
      password,
      promote: true,
    });
  }

  for (const holder of SEED_ACCOUNT_HOLDERS) {
    await ensureUser({
      username: holder.username,
      fullName: holder.fullName,
      role: ROLE_CUENTAHABIENTE,
      password,
      promote: false,
    });
  }
}

async function ensureUser(input: {
  username: string;
  fullName: string;
  role: UserRole;
  password: string;
  promote: boolean;
}): Promise<void> {
  const existing = await User.findOne({ username: input.username });
  if (!existing) {
    try {
      await User.create({
        username: input.username,
        fullName: input.fullName,
        role: input.role,
        passwordHash: await hashPassword(input.password),
      });
    } catch (error) {
      if (!isDuplicateKey(error)) {
        throw error;
      }
    }
    return;
  }

  if (input.promote && existing.role !== input.role) {
    existing.role = input.role;
    await existing.save();
  }
}
