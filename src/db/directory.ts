import { ROLE_ADMINISTRADOR, ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { userRoleSchema, type UserRole } from "@/domain/schemas";
import { connectDb } from "./connect";
import { readPlatformSettings } from "./models/platform-settings";
import { User } from "./models/user";

export type DirectoryPerson = {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
};

export async function platformDisplayName(): Promise<string> {
  await connectDb();
  return (await readPlatformSettings()).displayName;
}

export async function accessCounts(): Promise<{ holders: number; admins: number }> {
  await connectDb();
  const [holders, admins] = await Promise.all([
    User.countDocuments({ role: ROLE_CUENTAHABIENTE }),
    User.countDocuments({ role: ROLE_ADMINISTRADOR }),
  ]);
  return { holders, admins };
}

export async function listPeople(): Promise<DirectoryPerson[]> {
  await connectDb();
  const docs = await User.find()
    .select("username fullName role")
    .sort({ role: 1, username: 1 })
    .lean();

  return docs.flatMap((doc) => {
    const role = userRoleSchema.safeParse(doc.role);
    const id = typeof doc._id?.toString === "function" ? doc._id.toString() : "";
    if (!role.success || typeof doc.username !== "string" || !id) {
      return [];
    }
    return [
      {
        id,
        username: doc.username,
        fullName: typeof doc.fullName === "string" ? doc.fullName : "",
        role: role.data,
      },
    ];
  });
}
