import "server-only";

import type { ClientSession } from "mongoose";
import { ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { AccountModel } from "@/db/models/account";
import { User } from "@/db/models/user";
import { isObjectId } from "@/db/object-id";
import { ACCOUNT_KIND_LABEL } from "@/accounts/opening";
import { formatIban, isValidSpanishIban } from "@/domain/iban";
import { balanceOf } from "@/ledger/balance";
import { denyTransfer, type TransferDenial } from "./rules";

export type TransferPreview =
  | { ok: false; reason: TransferDenial }
  | {
      ok: true;
      destinationAccountId: string;
      fromLabel: string;
      fromIban: string;
      recipientLabel: string;
      toIban: string;
    };

export async function inspectTransfer(
  input: {
    actorId: string;
    fromAccountId: string;
    recipientUserId: string;
    amountMinor: number;
  },
  session?: ClientSession,
): Promise<TransferPreview> {
  if (!isObjectId(input.actorId) || !isObjectId(input.fromAccountId)) {
    return { ok: false, reason: "source" };
  }
  if (!isObjectId(input.recipientUserId)) {
    return { ok: false, reason: "recipient" };
  }

  const destinationQuery = AccountModel.findOne({
    ownerId: input.recipientUserId,
    kind: "checking",
  });
  const [actor, recipient, source, destination] = await Promise.all([
    readUser(input.actorId, session),
    readUser(input.recipientUserId, session),
    readAccount(input.fromAccountId, session),
    session ? destinationQuery.session(session) : destinationQuery,
  ]);

  const sourceKind = source?.kind === "checking" || source?.kind === "savings" ? source.kind : null;
  const sourceBalance = source ? await balanceOf(String(source._id), session) : 0;
  const denial = denyTransfer({
    actorId: input.actorId,
    actorIsHolder: actor?.role === ROLE_CUENTAHABIENTE,
    recipientId: input.recipientUserId,
    recipientIsHolder: recipient?.role === ROLE_CUENTAHABIENTE,
    sourceOwnerId: typeof source?.ownerId === "string" ? source.ownerId : null,
    sourceOpen: source?.status === "open" && sourceKind !== null,
    destinationOpen: destination?.status === "open",
    amountMinor: input.amountMinor,
    sourceBalanceMinor: sourceBalance,
  });

  const fromIban = typeof source?.iban === "string" ? source.iban : "";
  const toIban = typeof destination?.iban === "string" ? destination.iban : "";
  if (denial || !destination || !sourceKind || !isValidSpanishIban(fromIban) || !isValidSpanishIban(toIban)) {
    return { ok: false, reason: denial ?? "closed" };
  }

  return {
    ok: true,
    destinationAccountId: String(destination._id),
    fromLabel: ACCOUNT_KIND_LABEL[sourceKind],
    fromIban: formatIban(fromIban),
    recipientLabel: personLabel(recipient),
    toIban: formatIban(toIban),
  };
}

function personLabel(person: { fullName?: unknown; username?: unknown } | null): string {
  const fullName = typeof person?.fullName === "string" ? person.fullName.trim() : "";
  if (fullName) {
    return fullName;
  }
  return typeof person?.username === "string" && person.username ? person.username : "Cuentahabiente";
}

async function readUser(id: string, session?: ClientSession) {
  const query = User.findById(id).select("role username fullName");
  return session ? query.session(session).lean() : query.lean();
}

async function readAccount(id: string, session?: ClientSession) {
  const query = AccountModel.findById(id);
  return session ? query.session(session).lean() : query.lean();
}
