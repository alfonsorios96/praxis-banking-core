"use client";

import { useState } from "react";
import { useActionState } from "react";
import { updateRelease } from "@/app/actions/release";

type Holder = {
  id: string;
  username: string;
  fullName: string;
};

type StepDraft = {
  at: string;
  percent: string;
};

function toLocalInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ReleaseForm({
  buildId,
  percent,
  allowUserIds,
  steps,
  holders,
  eligibleHolders,
  holderCount,
}: {
  buildId: string;
  percent: number;
  allowUserIds: string[];
  steps: { at: string; percent: number }[];
  holders: Holder[];
  eligibleHolders: number;
  holderCount: number;
}) {
  const [state, action, pending] = useActionState(updateRelease, undefined);
  const [drafts, setDrafts] = useState<StepDraft[]>(
    steps.map((step) => ({ at: toLocalInput(step.at), percent: String(step.percent) })),
  );

  const stepsValue = JSON.stringify(
    drafts.flatMap((draft) => {
      if (!draft.at || draft.percent.trim() === "") {
        return [];
      }
      const at = new Date(draft.at);
      const stepPercent = Number(draft.percent);
      if (Number.isNaN(at.getTime()) || !Number.isInteger(stepPercent)) {
        return [{ at: draft.at, percent: stepPercent }];
      }
      return [{ at: at.toISOString(), percent: stepPercent }];
    }),
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-sm break-all text-ink">{buildId}</p>
        <p className="text-sm leading-6 text-muted">
          {holderCount === 0
            ? "Todavía no hay cuentahabientes."
            : `Ahora entrarían ${eligibleHolders} de ${holderCount} cuentahabientes.`}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="percent" className="text-sm font-medium text-ink">
          Porcentaje
        </label>
        <input
          id="percent"
          name="percent"
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          step={1}
          required
          defaultValue={percent}
          className="min-h-12 rounded-2xl border border-line bg-white px-4 text-base text-ink outline-none focus:border-accent"
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink">Personas concretas</legend>
        <p className="text-sm leading-6 text-muted">
          Entran además del porcentaje. Los administradores ya reciben esta versión.
        </p>
        {holders.length === 0 ? (
          <p className="text-sm text-muted">No hay cuentahabientes para marcar.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {holders.map((holder) => (
              <li key={holder.id}>
                <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-white/70 px-4">
                  <input
                    type="checkbox"
                    name="allowUserIds"
                    value={holder.id}
                    defaultChecked={allowUserIds.includes(holder.id)}
                    className="size-5 accent-accent"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                      {holder.fullName || holder.username}
                    </span>
                    {holder.fullName ? (
                      <span className="block truncate text-sm text-muted">{holder.username}</span>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-ink">Escalones</legend>
        <p className="text-sm leading-6 text-muted">
          Cuando llega la fecha, el porcentaje no baja de ese valor.
        </p>
        {drafts.map((draft, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-2xl border border-line bg-white/70 p-3">
            <label className="flex flex-col gap-2 text-sm font-medium text-ink">
              Fecha
              <input
                type="datetime-local"
                value={draft.at}
                onChange={(event) => {
                  const at = event.target.value;
                  setDrafts((current) =>
                    current.map((item, itemIndex) => (itemIndex === index ? { ...item, at } : item)),
                  );
                }}
                className="min-h-12 rounded-2xl border border-line bg-white px-4 text-base font-normal text-ink outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-ink">
              Porcentaje
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                step={1}
                value={draft.percent}
                onChange={(event) => {
                  const nextPercent = event.target.value;
                  setDrafts((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, percent: nextPercent } : item,
                    ),
                  );
                }}
                className="min-h-12 rounded-2xl border border-line bg-white px-4 text-base font-normal text-ink outline-none focus:border-accent"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index));
              }}
              className="min-h-11 text-sm font-medium text-accent"
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setDrafts((current) => [...current, { at: "", percent: "" }])}
          className="min-h-12 rounded-2xl border border-line bg-white px-4 text-sm font-medium text-ink"
        >
          Añadir escalón
        </button>
      </fieldset>

      <input type="hidden" name="steps" value={stepsValue} />

      {state?.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.message ? (
        <p className="text-sm text-accent" role="status">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="min-h-12 rounded-2xl bg-accent px-4 text-base font-medium text-paper disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar release"}
      </button>
    </form>
  );
}
