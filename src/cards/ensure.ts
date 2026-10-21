import "server-only";

import { isDuplicateKey } from "@/db/duplicate";
import { AccountModel } from "@/db/models/account";
import { CardModel } from "@/db/models/card";
import { CARD_KINDS, cardExpiry, cardNumber, DAILY_LIMIT_CENTS } from "./mock";

export async function ensureHolderCards(): Promise<void> {
  const accounts = await AccountModel.find({
    kind: { $in: [...CARD_KINDS] },
    ownerId: { $type: "string" },
  })
    .select("_id ownerId kind")
    .lean();
  if (accounts.length === 0) {
    return;
  }

  const existing = await CardModel.find({
    accountId: { $in: accounts.map((account) => String(account._id)) },
  })
    .select("accountId")
    .lean();
  const carded = new Set(existing.map((card) => card.accountId));
  const issuedYear = new Date().getFullYear();

  for (const account of accounts) {
    const accountId = String(account._id);
    if (carded.has(accountId)) {
      continue;
    }
    const kind = account.kind === "savings" ? "savings" : "checking";
    const expiry = cardExpiry(accountId, issuedYear);
    try {
      await CardModel.create({
        ownerId: String(account.ownerId),
        accountId,
        kind,
        brand: "visa",
        last4: cardNumber(accountId).slice(-4),
        expMonth: expiry.month,
        expYear: expiry.year,
        status: "active",
        limitMinor: DAILY_LIMIT_CENTS[kind],
      });
    } catch (error) {
      if (!isDuplicateKey(error)) {
        throw error;
      }
    }
  }
}
