import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { connectDb } from "@/db/connect";
import { DeviceTokenModel } from "@/db/models/device-token";
import { User } from "@/db/models/user";
import type { ModuleKey } from "@/modules/keys";
import { type FirebaseAdminCredentials, readFirebaseAdminCredentials } from "./credentials";
import { deliverPush } from "./deliver";
import { modulePushData, transferPushData, visibleSenderLabel } from "./message";

export async function notifyTransferReceived(input: {
  recipientUserId: string;
  amountMinor: number;
  senderUserId: string;
  senderFallback: string;
}): Promise<void> {
  const credentials = readFirebaseAdminCredentials();
  if (!credentials) {
    return;
  }

  try {
    await connectDb();
    const sender = await User.findById(input.senderUserId).select("fullName username").lean();
    const senderLabel = visibleSenderLabel(sender, input.senderFallback);
    await pushToUsers(
      credentials,
      [input.recipientUserId],
      transferPushData({ amountMinor: input.amountMinor, senderLabel }),
    );
  } catch (error) {
    console.error("[praxis] push", error instanceof Error ? error.message : "error");
  }
}

export async function notifyModuleChanged(input: {
  userIds: string[];
  key: ModuleKey;
  enabled: boolean;
}): Promise<void> {
  const credentials = readFirebaseAdminCredentials();
  if (!credentials || input.userIds.length === 0) {
    return;
  }

  try {
    await connectDb();
    await pushToUsers(credentials, input.userIds, modulePushData(input.key, input.enabled));
  } catch (error) {
    console.error("[praxis] push", error instanceof Error ? error.message : "error");
  }
}

async function pushToUsers(
  credentials: FirebaseAdminCredentials,
  userIds: string[],
  data: Record<string, string>,
): Promise<void> {
  const rows = await DeviceTokenModel.find({ userId: { $in: userIds } }).select("token").lean();
  const tokens = rows
    .map((row) => (typeof row.token === "string" ? row.token : ""))
    .filter((token) => token.length > 0);
  const messaging = getMessaging(messagingApp(credentials));

  await deliverPush({
    credentials,
    tokens,
    data,
    send: async (token, payload) => {
      await messaging.send({ token, data: payload });
    },
    forget: async (token) => {
      await DeviceTokenModel.deleteOne({ token });
    },
  });
}

function messagingApp(credentials: FirebaseAdminCredentials): App {
  const existing = getApps().find((app) => app.name === "praxis");
  if (existing) {
    return existing;
  }
  return initializeApp(
    {
      credential: cert({
        projectId: credentials.projectId,
        clientEmail: credentials.clientEmail,
        privateKey: credentials.privateKey,
      }),
    },
    "praxis",
  );
}
