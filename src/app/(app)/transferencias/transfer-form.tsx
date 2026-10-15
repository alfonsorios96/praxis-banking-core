"use client";

import { useActionState } from "react";
import type { OwnedAccount, TransferRecipient } from "@/accounts/types";
import { transferAction } from "@/app/actions/transfer";

export function TransferForm({
  accounts,
  recipients,
}: {
  accounts: OwnedAccount[];
  recipients: TransferRecipient[];
}) {
  const [state, action, pending] = useActionState(transferAction, undefined);

  if (state?.step === "review" && state.draft) {
    const draft = state.draft;
    return (
      <form action={action} className="flex flex-col gap-5">
        <input type="hidden" name="confirm" value="yes" />
        <input type="hidden" name="fromAccountId" value={draft.fromAccountId} />
        <input type="hidden" name="recipientUserId" value={draft.recipientUserId} />
        <input type="hidden" name="amount" value={state.values?.amount ?? ""} />
        <input type="hidden" name="amountMinor" value={String(draft.amountMinor)} />
        <input type="hidden" name="idempotencyKey" value={draft.idempotencyKey} />
        <input type="hidden" name="fromLabel" value={draft.fromLabel} />
        <input type="hidden" name="fromIban" value={draft.fromIban} />
        <input type="hidden" name="recipientLabel" value={draft.recipientLabel} />
        <input type="hidden" name="toIban" value={draft.toIban} />
        <input type="hidden" name="amountLabel" value={draft.amountLabel} />
        <div>
          <p className="text-sm text-muted">Vas a transferir</p>
          <p className="amount mt-1">{draft.amountLabel}</p>
        </div>
        <div className="border-t border-line pt-4">
          <p className="text-sm text-muted">Desde {draft.fromLabel}</p>
          <p className="text-sm break-all text-ink tabular-nums">{draft.fromIban}</p>
          <p className="mt-4 text-sm text-muted">Para {draft.recipientLabel}</p>
          <p className="text-sm break-all text-ink tabular-nums">{draft.toIban}</p>
        </div>
        {state.error ? (
          <p className="error" role="alert">
            {state.error}
          </p>
        ) : (
          <p className="text-sm leading-6 text-muted">
            Al confirmar, el dinero sale de tu cuenta y entra en la corriente de destino.
          </p>
        )}
        <button type="submit" name="intent" value="confirm" disabled={pending} className="btn-primary">
          {pending ? "Confirmando…" : "Confirmar"}
        </button>
        <button type="submit" name="intent" value="edit" disabled={pending} className="btn-secondary">
          Corregir
        </button>
      </form>
    );
  }

  const draftKey = [
    state?.values?.fromAccountId ?? "",
    state?.values?.recipientUserId ?? "",
    state?.values?.amount ?? "",
  ].join("|");

  return (
    <form key={draftKey} action={action} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink">Desde</legend>
        <div className="divide-y divide-line border-t border-line">
          {accounts.map((account) => (
            <label key={account.id} className="flex min-h-12 items-center gap-3 py-3">
              <input
                type="radio"
                name="fromAccountId"
                value={account.id}
                required
                defaultChecked={
                  state?.values?.fromAccountId
                    ? state.values.fromAccountId === account.id
                    : account.kind === "checking"
                }
                className="size-4 accent-accent"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-1 text-base text-ink">
                <span className="flex items-baseline justify-between gap-3">
                  <span>{account.label}</span>
                  <span className="text-sm text-muted tabular-nums">{account.balanceLabel}</span>
                </span>
                <span className="text-sm break-all text-muted tabular-nums">{account.ibanLabel}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="recipientUserId" className="text-sm font-medium text-ink">
          Para
        </label>
        <select
          id="recipientUserId"
          name="recipientUserId"
          required
          defaultValue={state?.values?.recipientUserId ?? ""}
          className="field"
        >
          <option value="" disabled>
            Elige un cuentahabiente
          </option>
          {recipients.map((recipient) => (
            <option key={recipient.id} value={recipient.id}>
              {recipient.label} · {recipient.ibanLabel}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="amount" className="text-sm font-medium text-ink">
          Importe en euros
        </label>
        <input
          id="amount"
          name="amount"
          inputMode="decimal"
          autoComplete="off"
          required
          placeholder="0,00"
          defaultValue={state?.values?.amount ?? ""}
          className="field tabular-nums"
        />
      </div>

      {state?.error ? (
        <p className="error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button type="submit" name="intent" value="review" disabled={pending} className="btn-primary">
        {pending ? "Revisando…" : "Revisar"}
      </button>
    </form>
  );
}
