"use client";

import { Plus, TriangleAlert } from "lucide-react";
import { useActionState } from "react";
import { createDigitalCard, type DigitalCardState } from "@/app/actions/cards";

export function DigitalCardIssuer() {
  const [state, action, pending] = useActionState<DigitalCardState | undefined>(
    createDigitalCard,
    undefined,
  );

  return (
    <div className="flex flex-col gap-3 border-t border-line pt-6">
      <h2 className="section-title">Tarjeta digital</h2>
      <p className="text-base leading-6 text-muted">
        Para comprar en línea y pagar con el móvil. Va contra tu cuenta corriente y está lista al
        momento.
      </p>
      <form action={action}>
        <button type="submit" className="btn-secondary w-full gap-2" disabled={pending}>
          <Plus aria-hidden className="size-5" />
          {pending ? "Creando tarjeta digital…" : "Crear tarjeta digital"}
        </button>
      </form>
      <div aria-live="polite">
        {state?.unavailable ? (
          <div
            role="alert"
            className="flex gap-3 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3"
          >
            <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
            <div className="flex flex-col gap-1">
              <p className="text-base font-medium text-ink">
                Temporalmente no podemos crear tu tarjeta digital
              </p>
              <p className="text-sm leading-6 text-muted">
                Estamos trabajando en ello. Inténtalo de nuevo en unos minutos.
              </p>
            </div>
          </div>
        ) : state?.error ? (
          <p className="error" role="alert">
            {state.error}
          </p>
        ) : state?.message ? (
          <p className="status">{state.message}</p>
        ) : null}
      </div>
    </div>
  );
}
