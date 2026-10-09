"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { acceptRelease } from "@/app/actions/release";
import { RELEASE_APPLY_STORAGE_KEY } from "@/releases/constants";

function subscribe(): () => void {
  return () => {};
}

function applyOnLoad(buildId: string): boolean {
  return sessionStorage.getItem(RELEASE_APPLY_STORAGE_KEY) === buildId;
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
  const deferred = useSyncExternalStore(
    subscribe,
    () => applyOnLoad(buildId),
    () => false,
  );
  const [dismissed, setDismissed] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const loadNow = useCallback(async (): Promise<void> => {
    setPending(true);
    setError(null);
    try {
      const result = await acceptRelease(buildId);
      if (!result.ok) {
        sessionStorage.removeItem(RELEASE_APPLY_STORAGE_KEY);
        setFailed(true);
        setPending(false);
        setError("No se pudo cargar esta versión.");
        return;
      }
      await activateWaitingWorker();
      sessionStorage.removeItem(RELEASE_APPLY_STORAGE_KEY);
      window.location.reload();
    } catch {
      sessionStorage.removeItem(RELEASE_APPLY_STORAGE_KEY);
      setFailed(true);
      setPending(false);
      setError("No se pudo cargar esta versión.");
    }
  }, [buildId]);

  useEffect(() => {
    if (!deferred || failed || started.current) {
      return;
    }
    started.current = true;
    void loadNow();
  }, [deferred, failed, loadNow]);

  function dismiss(): void {
    sessionStorage.setItem(RELEASE_APPLY_STORAGE_KEY, buildId);
    setDismissed(true);
  }

  if (!failed && (deferred || pending)) {
    return <p className="mb-6 text-sm text-muted">Cargando la versión nueva…</p>;
  }
  if (dismissed) {
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
          Cargar ahora
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
