import "server-only";

import mongoose, { type ClientSession } from "mongoose";
import { connectDb } from "@/db/connect";
import { isDuplicateKey } from "@/db/duplicate";
import { AccountModel } from "@/db/models/account";
import { LedgerEntryModel } from "@/db/models/ledger-entry";
import { TransferModel } from "@/db/models/transfer";
import { CURRENCY } from "@/domain/schemas";
import { writeBalancedEntry } from "@/ledger/write";
import { inspectTransfer } from "./inspect";
import type { TransferDenial } from "./rules";

const IDEMPOTENCY_KEY = /^[A-Za-z0-9:_-]{16,128}$/;

export type ConfirmResult = { ok: true; duplicate: boolean } | { ok: false; reason: TransferDenial };

class HaltTransfer extends Error {
  readonly denial: TransferDenial;

  constructor(denial: TransferDenial) {
    super(denial);
    this.name = "HaltTransfer";
    this.denial = denial;
  }
}

export async function confirmInternalTransfer(input: {
  actorId: string;
  fromAccountId: string;
  recipientUserId: string;
  amountMinor: number;
  idempotencyKey: string;
}): Promise<ConfirmResult> {
  if (!IDEMPOTENCY_KEY.test(input.idempotencyKey)) {
    return { ok: false, reason: "amount" };
  }

  await connectDb();
  if (await entryExists(input.idempotencyKey)) {
    return { ok: true, duplicate: true };
  }

  const session = await mongoose.startSession();
  let duplicate = false;

  try {
    await session.withTransaction(async () => {
      if (await entryExists(input.idempotencyKey, session)) {
        duplicate = true;
        return;
      }

      const destination = await AccountModel.findOne({
        ownerId: input.recipientUserId,
        kind: "checking",
      }).session(session);
      if (!destination) {
        throw new HaltTransfer("recipient");
      }

      await lockAccounts([input.fromAccountId, String(destination._id)], session);
      const fresh = await inspectTransfer(input, session);
      if (!fresh.ok) {
        throw new HaltTransfer(fresh.reason);
      }

      await writeBalancedEntry(
        {
          idempotencyKey: input.idempotencyKey,
          postings: [
            {
              accountId: input.fromAccountId,
              side: "debit",
              money: { currency: CURRENCY, amountMinor: input.amountMinor },
            },
            {
              accountId: fresh.destinationAccountId,
              side: "credit",
              money: { currency: CURRENCY, amountMinor: input.amountMinor },
            },
          ],
        },
        session,
      );
      await TransferModel.create(
        [
          {
            fromAccountId: input.fromAccountId,
            toAccountId: fresh.destinationAccountId,
            money: { currency: CURRENCY, amountMinor: input.amountMinor },
            status: "confirmed",
            idempotencyKey: input.idempotencyKey,
          },
        ],
        { session },
      );
    });
    return { ok: true, duplicate };
  } catch (error) {
    if (error instanceof HaltTransfer) {
      return { ok: false, reason: error.denial };
    }
    if (isDuplicateKey(error)) {
      return { ok: true, duplicate: true };
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

async function entryExists(idempotencyKey: string, session?: ClientSession): Promise<boolean> {
  const query = LedgerEntryModel.findOne({ idempotencyKey }).select("_id");
  const existing = session ? await query.session(session) : await query;
  return Boolean(existing);
}

async function lockAccounts(ids: string[], session: ClientSession): Promise<void> {
  for (const id of [...new Set(ids)].sort()) {
    const updated = await AccountModel.updateOne(
      { _id: id },
      { $currentDate: { updatedAt: true } },
      { session },
    );
    if (updated.matchedCount !== 1) {
      throw new HaltTransfer("closed");
    }
  }
}
