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
          className="min-h-12 rounded-2xl border border-line bg-white px-4 text-base text-ink outline-none focus:border-accent"
        />
      </div>
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
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
