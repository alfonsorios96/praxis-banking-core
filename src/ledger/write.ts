import "server-only";

import type { ClientSession } from "mongoose";
import { isDuplicateKey } from "@/db/duplicate";
import { LedgerEntryModel } from "@/db/models/ledger-entry";
import { postingsAreBalanced } from "@/domain/postings";
import { ledgerEntrySchema, type LedgerEntry } from "@/domain/schemas";

type Posting = LedgerEntry["postings"][number];

export async function writeBalancedEntry(
  input: { idempotencyKey: string; postings: Posting[] },
  session?: ClientSession,
): Promise<{ id: string; duplicate: boolean }> {
  const parsed = ledgerEntrySchema.safeParse({
    id: "pending",
    idempotencyKey: input.idempotencyKey,
    postings: input.postings,
  });

  if (!parsed.success || !postingsAreBalanced(input.postings)) {
    throw new Error("Unbalanced or invalid ledger entry.");
  }

  try {
    const created = await LedgerEntryModel.create(
      [
        {
          idempotencyKey: input.idempotencyKey,
          postings: input.postings,
        },
      ],
      session ? { session } : {},
    );
    return { id: String(created[0]._id), duplicate: false };
  } catch (error) {
    if (!isDuplicateKey(error) || session) {
      throw error;
    }

    const existing = await LedgerEntryModel.findOne({
      idempotencyKey: input.idempotencyKey,
    }).select("_id");
    if (!existing) {
      throw error;
    }
    return { id: String(existing._id), duplicate: true };
  }
}
