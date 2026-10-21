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
    CardModel.find({ ownerId: userId, status: { $ne: "cancelled" } }).lean(),
    User.findById(userId).select("username fullName").lean(),
  ]);
  const fullName = typeof owner?.fullName === "string" ? owner.fullName.trim() : "";
  const holderName = (fullName || String(owner?.username ?? "")).toLocaleUpperCase("es-ES");

  const cards = await Promise.all(
    docs.map(async (doc) => {
      const kind = doc.kind === "savings" ? "savings" : "checking";
      const number = cardNumber(doc.accountId);
      return {
        id: String(doc._id),
        kind,
        accountLabel: ACCOUNT_KIND_LABEL[kind],
        balanceLabel: formatEur(await balanceOf(doc.accountId)),
        last4: doc.last4,
        numberLabel: formatCardNumber(number),
        expLabel: formatExpiry(doc.expMonth, doc.expYear),
        cvv: cardCvv(doc.accountId),
        holderName,
        status: doc.status === "frozen" ? "frozen" : "active",
        limitLabel: formatEur(doc.limitMinor),
      } satisfies OwnedCard;
    }),
  );

  cards.sort((left, right) => Number(left.kind === "savings") - Number(right.kind === "savings"));
  return cards;
}
