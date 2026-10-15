"use client";

import { useActionState } from "react";
import { updatePlatformName } from "@/app/actions/platform";

export function SettingsForm({ displayName }: { displayName: string }) {
  const [state, action, pending] = useActionState(updatePlatformName, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label htmlFor="displayName" className="text-sm font-medium text-ink">
          Nombre visible
        </label>
        <input
          id="displayName"
          name="displayName"
          required
          minLength={2}
          maxLength={40}
          defaultValue={displayName}
          className="field"
        />
      </div>
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
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
