import "server-only";

import { connectDb } from "@/db/connect";
import { ModuleAccessModel } from "@/db/models/module-access";
import { holdersToChange, moduleStateFrom, type ModuleKey, type ModuleState } from "./keys";

export async function readModuleState(userId: string): Promise<ModuleState> {
  await connectDb();
  const doc = await ModuleAccessModel.findOne({ userId }).select("cards payments transfers").lean();
  return moduleStateFrom(doc);
}

export async function readModuleStates(userIds: readonly string[]): Promise<Map<string, ModuleState>> {
  await connectDb();
  const docs = await ModuleAccessModel.find({ userId: { $in: [...userIds] } })
    .select("userId cards payments transfers")
    .lean();
  const states = new Map<string, ModuleState>();
  for (const userId of userIds) {
    states.set(userId, moduleStateFrom(null));
  }
  for (const doc of docs) {
    if (typeof doc.userId === "string") {
      states.set(doc.userId, moduleStateFrom(doc));
    }
  }
  return states;
}

export async function setModuleFor(
  userIds: readonly string[],
  key: ModuleKey,
  enabled: boolean,
): Promise<string[]> {
  const states = await readModuleStates(userIds);
  const changed = holdersToChange(states, userIds, key, enabled);
  if (changed.length > 0) {
    await ModuleAccessModel.bulkWrite(
      changed.map((userId) => ({
        updateOne: {
          filter: { userId },
          update: { $set: { [key]: enabled } },
          upsert: true,
        },
      })),
    );
  }
  return changed;
}
