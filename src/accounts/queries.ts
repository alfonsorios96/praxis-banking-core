import "server-only";

import { ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { AccountModel } from "@/db/models/account";
import { User } from "@/db/models/user";
import { connectDb } from "@/db/connect";
import { formatIban } from "@/domain/iban";
import { formatEur } from "@/domain/money";
import { balanceOf } from "@/ledger/balance";
import { ACCOUNT_KIND_LABEL } from "./opening";
import type { OwnedAccount, TransferRecipient } from "./types";

export type { OwnedAccount, TransferRecipient };

export async function listOwnedAccounts(userId: string): Promise<OwnedAccount[]> {
  await connectDb();
  const docs = await AccountModel.find({
    ownerId: userId,
    kind: { $in: ["checking", "savings"] },
  }).lean();

  const accounts = await Promise.all(
    docs.map(async (doc) => {
      const kind = doc.kind === "savings" ? "savings" : "checking";
      const balanceMinor = await balanceOf(String(doc._id));
      return {
        id: String(doc._id),
        kind,
        label: ACCOUNT_KIND_LABEL[kind],
        ibanLabel: formatIban(typeof doc.iban === "string" ? doc.iban : ""),
        balanceLabel: formatEur(balanceMinor),
      } satisfies OwnedAccount;
    }),
  );

  accounts.sort((left, right) => Number(left.kind === "savings") - Number(right.kind === "savings"));
  return accounts;
}

export async function listTransferRecipients(actorId: string): Promise<TransferRecipient[]> {
  await connectDb();
  const docs = await User.find({ role: ROLE_CUENTAHABIENTE, _id: { $ne: actorId } })
    .select("username fullName")
    .sort({ fullName: 1, username: 1 })
    .lean();

  const ids = docs.map((doc) => String(doc._id ?? "")).filter(Boolean);
  const checking = await AccountModel.find({
    ownerId: { $in: ids },
    kind: "checking",
  })
    .select("ownerId iban")
    .lean();
  const ibanByOwner = new Map(
    checking.map((account) => [
      String(account.ownerId ?? ""),
      formatIban(typeof account.iban === "string" ? account.iban : ""),
    ]),
  );

  return docs.flatMap((doc) => {
    const id = String(doc._id ?? "");
    const ibanLabel = ibanByOwner.get(id);
    if (!id || !ibanLabel) {
      return [];
    }
    const fullName = typeof doc.fullName === "string" ? doc.fullName.trim() : "";
    return [{ id, label: fullName || String(doc.username ?? "Cuentahabiente"), ibanLabel }];
  });
}
