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
          className="field"
        />
        {state?.errors?.username ? (
          <p className="error">{state.errors.username[0]}</p>
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
          className="field"
        />
        {state?.errors?.password ? (
          <p className="error">{state.errors.password[0]}</p>
        ) : null}
      </div>

      {state?.message ? (
        <p className="error" role="alert">
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary mt-2">
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
