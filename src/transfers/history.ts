import "server-only";

import { ACCOUNT_KIND_LABEL } from "@/accounts/opening";
import { AccountModel } from "@/db/models/account";
import { User } from "@/db/models/user";
import { TransferModel } from "@/db/models/transfer";
import { connectDb } from "@/db/connect";
import { formatEur } from "@/domain/money";

export type TransferHistoryRow = {
  id: string;
  title: string;
  detail: string;
  amountLabel: string;
};

export async function listHolderTransfers(userId: string): Promise<TransferHistoryRow[]> {
  await connectDb();
  const owned = await AccountModel.find({
    ownerId: userId,
    kind: { $in: ["checking", "savings"] },
  }).select("_id");
  const ownIds = owned.map((account) => String(account._id));
  if (ownIds.length === 0) {
    return [];
  }

  const docs = await TransferModel.find({
    status: "confirmed",
    $or: [{ fromAccountId: { $in: ownIds } }, { toAccountId: { $in: ownIds } }],
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  const accountIds = new Set<string>();
  for (const doc of docs) {
    accountIds.add(String(doc.fromAccountId));
    accountIds.add(String(doc.toAccountId));
  }

  const accounts = await AccountModel.find({ _id: { $in: [...accountIds] } }).lean();
  const accountById = new Map(accounts.map((account) => [String(account._id), account]));
  const ownerIds = accounts.flatMap((account) =>
    typeof account.ownerId === "string" ? [account.ownerId] : [],
  );
  const people = await User.find({ _id: { $in: ownerIds } }).select("username fullName").lean();
  const nameById = new Map(
    people.map((person) => {
      const fullName = typeof person.fullName === "string" ? person.fullName.trim() : "";
      return [String(person._id), fullName || String(person.username ?? "Cuentahabiente")];
    }),
  );
  const own = new Set(ownIds);

  return docs.flatMap((doc) => {
    const fromId = String(doc.fromAccountId);
    const toId = String(doc.toAccountId);
    const sent = own.has(fromId);
    const account = accountById.get(sent ? fromId : toId);
    const counterpartyAccount = accountById.get(sent ? toId : fromId);
    const counterpartyId =
      counterpartyAccount && typeof counterpartyAccount.ownerId === "string"
        ? counterpartyAccount.ownerId
        : "";
    const amountMinor =
      doc.money && typeof doc.money === "object" && typeof doc.money.amountMinor === "number"
        ? doc.money.amountMinor
        : null;
    if (amountMinor === null) {
      return [];
    }

    const kind =
      account?.kind === "checking" || account?.kind === "savings" ? account.kind : "checking";
    const when = formatWhen(doc.createdAt);

    return [
      {
        id: String(doc._id),
        title: sent
          ? `Para ${nameById.get(counterpartyId) ?? "Cuentahabiente"}`
          : `De ${nameById.get(counterpartyId) ?? "Cuentahabiente"}`,
        detail: `${sent ? "Desde" : "En"} ${ACCOUNT_KIND_LABEL[kind]}${when ? ` · ${when}` : ""}`,
        amountLabel: formatEur(amountMinor),
      },
    ];
  });
}

function formatWhen(value: unknown): string {
  const date = value instanceof Date ? value : null;
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
