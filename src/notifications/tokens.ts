import "server-only";

import { connectDb } from "@/db/connect";
import { DeviceTokenModel } from "@/db/models/device-token";
import { deviceTokenSchema } from "./token";

export async function saveDeviceToken(userId: string, token: string): Promise<void> {
  await connectDb();
  await DeviceTokenModel.updateOne({ token }, { $set: { userId } }, { upsert: true });
}

export async function removeDeviceToken(userId: string, token: string): Promise<void> {
  const parsed = deviceTokenSchema.safeParse(token);
  if (!parsed.success) {
    return;
  }
  await connectDb();
  await DeviceTokenModel.deleteOne({ userId, token: parsed.data });
}
