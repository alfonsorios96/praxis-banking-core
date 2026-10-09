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
      <form action={action} className="flex flex-col gap-4">
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
        <div className="rounded-2xl border border-line bg-white/70 px-4 py-4">
          <p className="text-sm text-muted">Desde {draft.fromLabel}</p>
          <p className="text-sm break-all text-ink">{draft.fromIban}</p>
          <p className="mt-3 text-base text-ink">Para {draft.recipientLabel}</p>
          <p className="text-sm break-all text-ink">{draft.toIban}</p>
          <p className="mt-3 font-display text-4xl tracking-tight text-ink">{draft.amountLabel}</p>
        </div>
        {state.error ? (
          <p className="text-sm text-red-700" role="alert">
            {state.error}
          </p>
        ) : (
          <p className="text-sm leading-6 text-muted">
            Al confirmar, el ledger debita tu IBAN y abona el IBAN de la corriente del destinatario.
          </p>
        )}
        <button
          type="submit"
          name="intent"
          value="confirm"
          disabled={pending}
          className="min-h-12 rounded-2xl bg-accent px-4 text-base font-medium text-paper disabled:opacity-60"
        >
          {pending ? "Confirmando…" : "Confirmar"}
        </button>
        <button
          type="submit"
          name="intent"
          value="edit"
          disabled={pending}
          className="min-h-12 rounded-2xl border border-line bg-white px-4 text-base font-medium text-ink disabled:opacity-60"
        >
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
    <form key={draftKey} action={action} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink">Desde</legend>
        {accounts.map((account) => (
          <label
            key={account.id}
            className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-white px-4"
          >
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
              className="size-4 accent-[var(--color-accent)]"
            />
            <span className="flex min-w-0 flex-1 flex-col gap-1 text-base text-ink">
              <span className="flex items-baseline justify-between gap-3">
                <span>{account.label}</span>
                <span className="text-sm text-muted">{account.balanceLabel}</span>
              </span>
              <span className="text-xs break-all text-muted">{account.ibanLabel}</span>
            </span>
          </label>
        ))}
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
          className="min-h-12 rounded-2xl border border-line bg-white px-4 text-base text-ink outline-none focus:border-accent"
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
          className="min-h-12 rounded-2xl border border-line bg-white px-4 text-base text-ink outline-none focus:border-accent"
        />
      </div>

      {state?.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        name="intent"
        value="review"
        disabled={pending}
        className="min-h-12 rounded-2xl bg-accent px-4 text-base font-medium text-paper disabled:opacity-60"
      >
        {pending ? "Revisando…" : "Revisar"}
      </button>
    </form>
  );
}
