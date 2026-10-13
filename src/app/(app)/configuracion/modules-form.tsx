"use client";

import { useActionState } from "react";
import { updateModuleAccess } from "@/app/actions/modules";
import type { ModuleKey } from "@/modules/keys";

type Holder = {
  id: string;
  username: string;
  fullName: string;
  enabled: boolean;
};

export function ModulesForm({
  moduleKey,
  label,
  holders,
}: {
  moduleKey: ModuleKey;
  label: string;
  holders: Holder[];
}) {
  const [state, action, pending] = useActionState(updateModuleAccess, undefined);
  const active = holders.filter((holder) => holder.enabled).length;

  return (
    <form action={action} className="flex flex-col gap-3 rounded-2xl border border-line bg-white/70 p-4">
      <input type="hidden" name="module" value={moduleKey} />
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-medium text-ink">{label}</h3>
        <p className="shrink-0 text-sm text-muted">
          {active} de {holders.length} activos
        </p>
      </div>

      {holders.length === 0 ? (
        <p className="text-sm text-muted">No hay cuentahabientes.</p>
      ) : (
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">Cuentahabientes para {label}</legend>
          {holders.map((holder) => (
            <label
              key={holder.id}
              className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-white px-4"
            >
              <input
                type="checkbox"
                name="userIds"
                value={holder.id}
                className="size-5 accent-accent"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">
                  {holder.fullName || holder.username}
                </span>
                {holder.fullName ? (
                  <span className="block truncate text-sm text-muted">{holder.username}</span>
                ) : null}
              </span>
              <span
                className={`shrink-0 text-[10px] tracking-[0.14em] uppercase ${
                  holder.enabled ? "text-accent" : "text-muted"
                }`}
              >
                {holder.enabled ? "Activo" : "Apagado"}
              </span>
            </label>
          ))}
        </fieldset>
      )}

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

      <div className="grid grid-cols-2 gap-2">
        <button
          type="submit"
          name="intent"
          value="enable"
          disabled={pending || holders.length === 0}
          className="min-h-12 rounded-2xl bg-accent px-4 text-base font-medium text-paper disabled:opacity-60"
        >
          Activar
        </button>
        <button
          type="submit"
          name="intent"
          value="disable"
          disabled={pending || holders.length === 0}
          className="min-h-12 rounded-2xl border border-line bg-white px-4 text-base font-medium text-ink disabled:opacity-60"
        >
          Desactivar
        </button>
      </div>
    </form>
  );
}
