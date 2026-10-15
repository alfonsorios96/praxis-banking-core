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
    <form action={action} className="flex flex-col gap-3 border-t border-line pt-4">
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
        <fieldset className="divide-y divide-line border-t border-line">
          <legend className="sr-only">Cuentahabientes para {label}</legend>
          {holders.map((holder) => (
            <label key={holder.id} className="flex min-h-12 items-center gap-3 py-3">
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
              <span className={`shrink-0 text-sm ${holder.enabled ? "text-accent" : "text-muted"}`}>
                {holder.enabled ? "Activo" : "Apagado"}
              </span>
            </label>
          ))}
        </fieldset>
      )}

      {state?.error ? (
        <p className="error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.message ? (
        <p className="status" role="status">
          {state.message}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="submit"
          name="intent"
          value="enable"
          disabled={pending || holders.length === 0}
          className="btn-primary"
        >
          Activar
        </button>
        <button
          type="submit"
          name="intent"
          value="disable"
          disabled={pending || holders.length === 0}
          className="btn-secondary"
        >
          Desactivar
        </button>
      </div>
    </form>
  );
}
