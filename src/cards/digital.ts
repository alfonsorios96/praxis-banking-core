import "server-only";

import { Types } from "mongoose";
import { connectDb } from "@/db/connect";
import { AccountModel } from "@/db/models/account";
import { CardModel } from "@/db/models/card";
import { IncidentModel } from "@/db/models/incident";
import { readFaultSimulation, takeDigitalIssuanceSlot } from "@/db/models/platform-settings";
import {
  DIGITAL_ISSUANCE_FAULT,
  DIGITAL_ISSUANCE_OPERATION,
  failsAtSlot,
} from "@/monitoring/faults";
import { cardExpiry, cardNumber, DAILY_LIMIT_CENTS } from "./mock";

export type DigitalIssuance =
  | { outcome: "issued"; last4: string }
  | { outcome: "unavailable" }
  | { outcome: "no-account" };

export async function issueDigitalCard(ownerId: string): Promise<DigitalIssuance> {
  await connectDb();

  if (await readFaultSimulation()) {
    const slot = await takeDigitalIssuanceSlot();
    if (failsAtSlot(slot)) {
      await IncidentModel.create({
        code: DIGITAL_ISSUANCE_FAULT.code,
        concept: DIGITAL_ISSUANCE_FAULT.concept,
        operation: DIGITAL_ISSUANCE_OPERATION,
        ownerId,
      });
      console.error(
        `[praxis] ${DIGITAL_ISSUANCE_FAULT.code} ${DIGITAL_ISSUANCE_FAULT.concept} (simulado)`,
      );
      return { outcome: "unavailable" };
    }
  }

  const account = await AccountModel.findOne({ ownerId, kind: "checking", status: "open" })
    .select("_id")
    .lean();
  if (!account) {
    return { outcome: "no-account" };
  }

  const _id = new Types.ObjectId();
  const seed = String(_id);
  const expiry = cardExpiry(seed, new Date().getFullYear());
  const last4 = cardNumber(seed).slice(-4);
  await CardModel.create({
    _id,
    ownerId,
    accountId: String(account._id),
    medium: "digital",
    kind: "checking",
    brand: "visa",
    last4,
    expMonth: expiry.month,
    expYear: expiry.year,
    status: "active",
    limitMinor: DAILY_LIMIT_CENTS.checking,
  });
  return { outcome: "issued", last4 };
}
