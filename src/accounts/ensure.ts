import "server-only";

import { ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { isDuplicateKey } from "@/db/duplicate";
import { AccountModel } from "@/db/models/account";
import { LedgerEntryModel } from "@/db/models/ledger-entry";
import { TransferModel } from "@/db/models/transfer";
import { User } from "@/db/models/user";
import { CURRENCY } from "@/domain/schemas";
import { spanishIban } from "@/domain/iban";
import { writeBalancedEntry } from "@/ledger/write";
import { ACCOUNT_KIND_LABEL, OPENING_CENTS, openingIdempotencyKey } from "./opening";

const HOLDER_KINDS = ["checking", "savings"] as const;

export async function ensureHolderAccounts(): Promise<void> {
  await migrateToEuro();
  const treasuryId = await ensureTreasury();
  const holders = await User.find({ role: ROLE_CUENTAHABIENTE }).select("_id");

  for (const holder of holders) {
    const ownerId = String(holder._id);
    for (const kind of HOLDER_KINDS) {
      const accountId = await ensureCustomerAccount(ownerId, kind);
      await writeBalancedEntry({
        idempotencyKey: openingIdempotencyKey(accountId),
        postings: [
          {
            accountId: treasuryId,
            side: "debit",
            money: { currency: CURRENCY, amountMinor: OPENING_CENTS[kind] },
          },
          {
            accountId,
            side: "credit",
            money: { currency: CURRENCY, amountMinor: OPENING_CENTS[kind] },
          },
        ],
      });
    }
  }
}

export async function migrateToEuro(): Promise<void> {
  await AccountModel.updateMany({ currency: "MXN" }, { $set: { currency: CURRENCY } });
  await AccountModel.updateMany(
    { kind: "checking", label: "Cheques" },
    { $set: { label: ACCOUNT_KIND_LABEL.checking } },
  );
  await TransferModel.updateMany(
    { "money.currency": "MXN" },
    { $set: { "money.currency": CURRENCY } },
  );
  await LedgerEntryModel.updateMany(
    { "postings.money.currency": "MXN" },
    { $set: { "postings.$[posting].money.currency": CURRENCY } },
    { arrayFilters: [{ "posting.money.currency": "MXN" }] },
  );

  const pending = await AccountModel.find({
    $or: [{ iban: null }, { iban: "" }, { iban: { $exists: false } }],
  });

  for (const account of pending) {
    const ownerId = typeof account.ownerId === "string" ? account.ownerId : "";
    const seed = account.kind === "treasury" || !ownerId ? "treasury" : `${ownerId}:${account.kind}`;
    account.iban = spanishIban(seed);
    account.currency = CURRENCY;
    if (account.kind === "checking" || account.kind === "savings" || account.kind === "treasury") {
      account.label = ACCOUNT_KIND_LABEL[account.kind];
    }
    await account.save();
  }
}

async function ensureTreasury(): Promise<string> {
  const existing = await AccountModel.findOne({ kind: "treasury" }).select("_id");
  if (existing) {
    return String(existing._id);
  }

  try {
    const created = await AccountModel.create({
      ownerId: null,
      kind: "treasury",
      label: ACCOUNT_KIND_LABEL.treasury,
      iban: spanishIban("treasury"),
      status: "open",
      currency: CURRENCY,
    });
    return String(created._id);
  } catch (error) {
    if (!isDuplicateKey(error)) {
      throw error;
    }
    const again = await AccountModel.findOne({ kind: "treasury" }).select("_id");
    if (!again) {
      throw error;
    }
    return String(again._id);
  }
}

async function ensureCustomerAccount(
  ownerId: string,
  kind: (typeof HOLDER_KINDS)[number],
): Promise<string> {
  const existing = await AccountModel.findOne({ ownerId, kind }).select("_id");
  if (existing) {
    return String(existing._id);
  }

  try {
    const created = await AccountModel.create({
      ownerId,
      kind,
      label: ACCOUNT_KIND_LABEL[kind],
      iban: spanishIban(`${ownerId}:${kind}`),
      status: "open",
      currency: CURRENCY,
    });
    return String(created._id);
  } catch (error) {
    if (!isDuplicateKey(error)) {
      throw error;
    }
    const again = await AccountModel.findOne({ ownerId, kind }).select("_id");
    if (!again) {
      throw error;
    }
    return String(again._id);
  }
}
