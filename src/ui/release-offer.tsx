"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { acceptRelease } from "@/app/actions/release";
import { RELEASE_APPLY_STORAGE_KEY } from "@/releases/constants";
import { releasePromptStorageKey, shouldShowReleasePrompt } from "@/releases/prompt";

function subscribe(): () => void {
  return () => {};
}

function hasSeenReleasePrompt(buildId: string): boolean {
  try {
    if (window.localStorage.getItem(releasePromptStorageKey(buildId)) === "1") {
      return true;
    }
    return window.sessionStorage.getItem(RELEASE_APPLY_STORAGE_KEY) === buildId;
  } catch {
    return false;
  }
}

function rememberReleasePrompt(buildId: string): void {
  try {
    window.localStorage.setItem(releasePromptStorageKey(buildId), "1");
    window.sessionStorage.removeItem(RELEASE_APPLY_STORAGE_KEY);
  } catch {
    // Si el navegador no guarda, el aviso puede volver en el siguiente refresh.
  }
}

function readShowReleasePrompt(buildId: string): boolean {
  return shouldShowReleasePrompt(hasSeenReleasePrompt(buildId));
}

async function activateWaitingWorker(): Promise<void> {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  const registration = await navigator.serviceWorker.getRegistration();
  const waiting = registration?.waiting;
  if (!waiting) {
    return;
  }
  waiting.postMessage({ type: "SKIP_WAITING" });
  await new Promise<void>((resolve) => {
    const timeout = window.setTimeout(resolve, 1500);
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => {
        window.clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });
}

export function ReleaseOffer({ buildId }: { buildId: string }) {
  const show = useSyncExternalStore(
    subscribe,
    () => readShowReleasePrompt(buildId),
    () => false,
  );
  const [dismissed, setDismissed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSeenReleasePrompt(buildId)) {
      const remember = () => rememberReleasePrompt(buildId);
      window.addEventListener("pagehide", remember);
      return () => window.removeEventListener("pagehide", remember);
    }
    void applyRelease(buildId);
  }, [buildId]);

  async function loadNow(): Promise<void> {
    setPending(true);
    setError(null);
    rememberReleasePrompt(buildId);
    const ok = await applyRelease(buildId);
    if (!ok) {
      setPending(false);
      setError("No se pudo cargar esta versión.");
      return;
    }
    window.location.reload();
  }

  function dismiss(): void {
    rememberReleasePrompt(buildId);
    setDismissed(true);
  }

  if (!show || dismissed) {
    return null;
  }

  return (
    <section className="mb-6 rounded-2xl border border-line bg-white/70 px-4 py-4">
      <h2 className="text-sm font-medium text-ink">Hay una versión más reciente</h2>
      <p className="mt-1 text-sm leading-6 text-muted">
        Puedes cargarla ahora. Si esperas, el siguiente refresh la aplica.
      </p>
      {error ? (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => void loadNow()}
          disabled={pending}
          className="min-h-12 rounded-2xl bg-accent px-4 text-base font-medium text-paper disabled:opacity-60"
        >
          {pending ? "Cargando…" : "Cargar ahora"}
        </button>
        <button
          type="button"
          onClick={dismiss}
          disabled={pending}
          className="min-h-12 rounded-2xl border border-line bg-white px-4 text-base font-medium text-ink disabled:opacity-60"
        >
          Ahora no
        </button>
      </div>
    </section>
  );
}

async function applyRelease(buildId: string): Promise<boolean> {
  try {
    const result = await acceptRelease(buildId);
    if (!result.ok) {
      return false;
    }
    await activateWaitingWorker();
    return true;
  } catch {
    return false;
  }
}
