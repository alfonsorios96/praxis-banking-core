import "server-only";

import type { ClientSession } from "mongoose";
import { LedgerEntryModel } from "@/db/models/ledger-entry";
import { accountBalanceMinor, type BalancePosting } from "@/domain/balance";

export async function balanceOf(accountId: string, session?: ClientSession): Promise<number> {
  const query = LedgerEntryModel.find({ "postings.accountId": accountId });
  const docs: unknown[] = session ? await query.session(session).lean() : await query.lean();
  return accountBalanceMinor(readPostings(docs), accountId);
}

function readPostings(docs: unknown[]): BalancePosting[] {
  const postings: BalancePosting[] = [];

  for (const doc of docs) {
    if (!doc || typeof doc !== "object" || !("postings" in doc) || !Array.isArray(doc.postings)) {
      continue;
    }
    for (const row of doc.postings) {
      const posting = readPosting(row);
      if (posting) {
        postings.push(posting);
      }
    }
  }

  return postings;
}

function readPosting(row: unknown): BalancePosting | null {
  if (!row || typeof row !== "object") {
    return null;
  }

  const accountId = "accountId" in row && typeof row.accountId === "string" ? row.accountId : null;
  const side = "side" in row && (row.side === "debit" || row.side === "credit") ? row.side : null;
  const money = "money" in row && row.money && typeof row.money === "object" ? row.money : null;
  const amountMinor =
    money && "amountMinor" in money && typeof money.amountMinor === "number" ? money.amountMinor : null;

  if (!accountId || !side || amountMinor === null) {
    return null;
  }

  return { accountId, side, amountMinor };
}
