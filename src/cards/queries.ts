import "server-only";

import { ACCOUNT_KIND_LABEL } from "@/accounts/opening";
import { connectDb } from "@/db/connect";
import { CardModel } from "@/db/models/card";
import { User } from "@/db/models/user";
import { formatEur } from "@/domain/money";
import { balanceOf } from "@/ledger/balance";
import { cardCvv, cardNumber, formatCardNumber, formatExpiry } from "./mock";
import type { OwnedCard } from "./types";

export type { OwnedCard };

export async function listOwnedCards(userId: string): Promise<OwnedCard[]> {
  await connectDb();
  const [docs, owner] = await Promise.all([
    CardModel.find({ ownerId: userId, status: { $ne: "cancelled" } }).sort({ createdAt: 1 }).lean(),
    User.findById(userId).select("username fullName").lean(),
  ]);
  const fullName = typeof owner?.fullName === "string" ? owner.fullName.trim() : "";
  const holderName = (fullName || String(owner?.username ?? "")).toLocaleUpperCase("es-ES");

  const cards = await Promise.all(
    docs.map(async (doc) => {
      const kind = doc.kind === "savings" ? "savings" : "checking";
      const medium = doc.medium === "digital" ? "digital" : "plastic";
      const seed = medium === "digital" ? String(doc._id) : doc.accountId;
      const number = cardNumber(seed);
      return {
        id: String(doc._id),
        medium,
        kind,
        accountLabel: ACCOUNT_KIND_LABEL[kind],
        balanceLabel: formatEur(await balanceOf(doc.accountId)),
        last4: doc.last4,
        numberLabel: formatCardNumber(number),
        expLabel: formatExpiry(doc.expMonth, doc.expYear),
        cvv: cardCvv(seed),
        holderName,
        status: doc.status === "frozen" ? "frozen" : "active",
        limitLabel: formatEur(doc.limitMinor),
      } satisfies OwnedCard;
    }),
  );

  return cards.sort((left, right) => cardOrder(left) - cardOrder(right));
}

function cardOrder(card: OwnedCard): number {
  if (card.medium === "digital") {
    return 2;
  }
  return card.kind === "savings" ? 1 : 0;
}
