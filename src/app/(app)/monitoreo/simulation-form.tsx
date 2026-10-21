"use client";

import { useActionState, useOptimistic } from "react";
import { updateFaultSimulation, type FaultSimulationState } from "@/app/actions/monitoring";

export function SimulationForm({ simulating }: { simulating: boolean }) {
  const [on, setOptimisticOn] = useOptimistic(simulating);
  const [state, action, pending] = useActionState(
    async (previous: FaultSimulationState | undefined, formData: FormData) => {
      setOptimisticOn(formData.get("intent") === "on");
      return updateFaultSimulation(previous, formData);
    },
    undefined,
  );

  return (
    <div className="flex flex-col gap-3">
      <form action={action}>
        <input type="hidden" name="intent" value={on ? "off" : "on"} />
        <button
          type="submit"
          role="switch"
          aria-checked={on}
          disabled={pending}
          className="flex w-full items-center gap-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
        >
          <span className="flex-1">
            <span className="block text-base font-medium text-ink">
              Simular fallos de emisión digital
            </span>
            <span className="block text-sm leading-6 text-muted">
              {on
                ? "Encendida. 2 de cada 5 intentos devuelven 500."
                : "Apagada. Todas las emisiones se completan."}
            </span>
          </span>
          <span
            aria-hidden
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              on ? "bg-danger" : "bg-line"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform ${
                on ? "translate-x-5" : ""
              }`}
            />
          </span>
        </button>
      </form>
      <div className="min-h-5" aria-live="polite">
        {state?.error ? (
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
