"use client";

import { useActionState, useRef } from "react";
import { enterAsGuest } from "@/app/actions/guest";

export function GuestEntry() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(enterAsGuest, undefined);

  return (
    <>
      <button
        type="button"
        className="btn-quiet self-center"
        onClick={() => dialogRef.current?.showModal()}
      >
        Entrar como invitado
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="guest-title"
        className="m-auto w-[calc(100%-2.5rem)] max-w-sm rounded-2xl bg-paper p-6 text-ink backdrop:bg-ink/40"
      >
        <form action={action} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 id="guest-title" className="section-title">
              Entrar como invitado
            </h2>
            <p className="text-sm leading-5 text-muted">
              Te creamos un usuario de demo con tu nombre.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="guest-name" className="text-sm font-medium text-ink">
              Nombre
            </label>
            <input
              id="guest-name"
              name="name"
              autoComplete="name"
              defaultValue={state?.name}
              maxLength={120}
              required
              autoFocus
              className="field"
            />
            {state?.errors?.name ? <p className="error">{state.errors.name[0]}</p> : null}
          </div>

          {state?.message ? (
            <p className="error" role="alert">
              {state.message}
            </p>
          ) : null}

          <div className="flex flex-col gap-3">
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? "Creando…" : "Aceptar"}
            </button>
            <button
              type="button"
              disabled={pending}
              className="btn-secondary"
              onClick={() => dialogRef.current?.close()}
            >
              Cancelar
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
