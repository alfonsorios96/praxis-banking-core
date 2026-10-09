"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export function LoginForm({ from }: { from?: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="from" value={from ?? "/"} />
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-sm font-medium text-ink">
          Usuario
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          className="min-h-12 rounded-2xl border border-line bg-white px-4 text-base text-ink outline-none focus:border-accent"
        />
        {state?.errors?.username ? (
          <p className="text-sm text-red-700">{state.errors.username[0]}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-ink">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-12 rounded-2xl border border-line bg-white px-4 text-base text-ink outline-none focus:border-accent"
        />
        {state?.errors?.password ? (
          <p className="text-sm text-red-700">{state.errors.password[0]}</p>
        ) : null}
      </div>

      {state?.message ? (
        <p className="text-sm text-red-700" role="alert">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 min-h-12 rounded-2xl bg-accent px-4 text-base font-medium text-paper disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
