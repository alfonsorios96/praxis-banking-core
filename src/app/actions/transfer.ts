"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { requireRole } from "@/auth/guard";
import { eurosToCents, formatEur } from "@/domain/money";
import { confirmInternalTransfer } from "@/transfers/confirm";
import type { TransferActionState, TransferDraft } from "@/transfers/form-state";
import { inspectTransfer } from "@/transfers/inspect";
import { TRANSFER_DENIAL_MESSAGE } from "@/transfers/rules";

export async function transferAction(
  _state: TransferActionState | undefined,
  formData: FormData,
): Promise<TransferActionState> {
  const session = await requireRole(ROLE_CUENTAHABIENTE);
  const intent = String(formData.get("intent") ?? "");
  const values = {
    fromAccountId: String(formData.get("fromAccountId") ?? ""),
    recipientUserId: String(formData.get("recipientUserId") ?? ""),
    amount: String(formData.get("amount") ?? ""),
  };

  if (intent === "edit") {
    return { step: "edit", values };
  }

  if (intent === "confirm") {
    if (formData.get("confirm") !== "yes") {
      return { step: "edit", error: "Falta la confirmación del titular.", values };
    }

    const amountMinor = Number(formData.get("amountMinor"));
    const idempotencyKey = String(formData.get("idempotencyKey") ?? "");
    const draft = draftFromForm(formData, amountMinor, idempotencyKey);
    let result: Awaited<ReturnType<typeof confirmInternalTransfer>>;
    try {
      result = await confirmInternalTransfer({
        actorId: session.userId,
        fromAccountId: values.fromAccountId,
        recipientUserId: values.recipientUserId,
        amountMinor,
        idempotencyKey,
      });
    } catch (error) {
      console.error("[praxis] transfer", error instanceof Error ? error.message : "error");
      return {
        step: "review",
        error: "No se pudo hacer la transferencia. Inténtalo de nuevo.",
        values,
        draft,
      };
    }

    if (!result.ok) {
      return {
        step: "review",
        error: TRANSFER_DENIAL_MESSAGE[result.reason],
        values,
        draft,
      };
    }

    redirect("/transferencias?hecha=1");
  }

  const amountMinor = eurosToCents(values.amount);
  if (amountMinor === null) {
    return { step: "edit", error: TRANSFER_DENIAL_MESSAGE.amount, values };
  }

  let preview: Awaited<ReturnType<typeof inspectTransfer>>;
  try {
    preview = await inspectTransfer({
      actorId: session.userId,
      fromAccountId: values.fromAccountId,
      recipientUserId: values.recipientUserId,
      amountMinor,
    });
  } catch (error) {
    console.error("[praxis] transfer", error instanceof Error ? error.message : "error");
    return {
      step: "edit",
      error: "No se pudo revisar la transferencia. Inténtalo de nuevo.",
      values,
    };
  }

  if (!preview.ok) {
    return { step: "edit", error: TRANSFER_DENIAL_MESSAGE[preview.reason], values };
  }

  return {
    step: "review",
    values,
    draft: {
      fromAccountId: values.fromAccountId,
      recipientUserId: values.recipientUserId,
      amountMinor,
      idempotencyKey: randomUUID(),
      fromLabel: preview.fromLabel,
      fromIban: preview.fromIban,
      recipientLabel: preview.recipientLabel,
      toIban: preview.toIban,
      amountLabel: formatEur(amountMinor),
    },
  };
}

function draftFromForm(formData: FormData, amountMinor: number, idempotencyKey: string): TransferDraft {
  return {
    fromAccountId: String(formData.get("fromAccountId") ?? ""),
    recipientUserId: String(formData.get("recipientUserId") ?? ""),
    amountMinor: Number.isInteger(amountMinor) ? amountMinor : 0,
    idempotencyKey,
    fromLabel: String(formData.get("fromLabel") ?? "Tu cuenta"),
    fromIban: String(formData.get("fromIban") ?? ""),
    recipientLabel: String(formData.get("recipientLabel") ?? "Destinatario"),
    toIban: String(formData.get("toIban") ?? ""),
    amountLabel: String(formData.get("amountLabel") ?? ""),
  };
}
