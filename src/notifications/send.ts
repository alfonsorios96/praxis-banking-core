import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { connectDb } from "@/db/connect";
import { DeviceTokenModel } from "@/db/models/device-token";
import { User } from "@/db/models/user";
import { type FirebaseAdminCredentials, readFirebaseAdminCredentials } from "./credentials";
import { deliverTransferPush } from "./deliver";
import { transferPushData, visibleSenderLabel } from "./message";

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
    const rows = await DeviceTokenModel.find({ userId: input.recipientUserId }).select("token").lean();
    const tokens = rows
      .map((row) => (typeof row.token === "string" ? row.token : ""))
      .filter((token) => token.length > 0);
    const messaging = getMessaging(messagingApp(credentials));

    await deliverTransferPush({
      credentials,
      tokens,
      data: transferPushData({ amountMinor: input.amountMinor, senderLabel }),
      send: async (token, data) => {
        await messaging.send({ token, data });
      },
      forget: async (token) => {
        await DeviceTokenModel.deleteOne({ token });
      },
    });
  } catch (error) {
    console.error("[praxis] push", error instanceof Error ? error.message : "error");
  }
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
