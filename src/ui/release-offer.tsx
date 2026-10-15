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
    <section className="mb-6 flex flex-col gap-3 border-b border-line pb-4">
      <h2 className="text-base font-medium text-ink">Hay una versión más reciente</h2>
      <p className="text-sm leading-6 text-muted">
        Puedes cargarla ahora. Si esperas, el siguiente refresh la aplica.
      </p>
      {error ? (
        <p className="error" role="alert">
          {error} Vuelve a intentarlo.
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <button type="button" onClick={() => void loadNow()} disabled={pending} className="btn-primary">
          {pending ? "Cargando…" : "Cargar ahora"}
        </button>
        <button type="button" onClick={dismiss} disabled={pending} className="btn-secondary">
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
