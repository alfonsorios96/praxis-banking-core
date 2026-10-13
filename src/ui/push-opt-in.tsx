"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { registerDeviceToken } from "@/app/actions/push";
import { listenForeground, subscribeDevice } from "@/notifications/browser";
import { readFirebasePublicConfig, type FirebasePublicConfig } from "@/notifications/credentials";
import { writeDeviceToken } from "@/notifications/storage";

const HIDDEN = "hidden";

type PushGate = NotificationPermission | typeof HIDDEN;

export function PushOptIn() {
  const detected = useSyncExternalStore(subscribePushGate, readPushGate, () => HIDDEN);
  const [override, setOverride] = useState<NotificationPermission | null>(null);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const permission = override ?? (detected === HIDDEN ? null : detected);

  useEffect(() => {
    if (detected === HIDDEN) {
      return;
    }
    const config = readFirebasePublicConfig();
    if (!config) {
      return;
    }
    let stop = () => {};
    try {
      stop = listenForeground(config, (message) => {
        if (Notification.permission !== "granted") {
          return;
        }
        const notification = new Notification(message.title, { body: message.body });
        notification.onclick = () => {
          window.focus();
          window.location.assign(message.url);
        };
      });
    } catch {
      return;
    }
    if (detected === "granted") {
      void activate(config).then((ok) => {
        if (!ok) {
          setFailed(true);
        }
      });
    }
    return stop;
  }, [detected]);

  async function enable() {
    const config = readFirebasePublicConfig();
    if (!config) {
      return;
    }
    setPending(true);
    setFailed(false);
    try {
      const next = await Notification.requestPermission();
      setOverride(next);
      if (next !== "granted") {
        return;
      }
      const ok = await activate(config);
      if (!ok) {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  if (!permission) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2 rounded-2xl border border-line bg-white/70 px-4 py-4">
      <p className="text-sm font-medium text-ink">Avisos de transferencias</p>
      {permission === "granted" ? (
        <p className="text-sm leading-6 text-muted">
          {failed ? "No se pudieron activar los avisos." : "Avisos activos en este dispositivo."}
        </p>
      ) : null}
      {permission === "denied" ? (
        <p className="text-sm leading-6 text-muted">El navegador tiene los avisos bloqueados.</p>
      ) : null}
      {permission === "default" ? (
        <>
          <p className="text-sm leading-6 text-muted">
            Te avisamos en este teléfono cuando recibes un traspaso.
          </p>
          {failed ? (
            <p className="text-sm text-red-700" role="alert">
              No se pudieron activar los avisos.
            </p>
          ) : null}
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              void enable();
            }}
            className="min-h-12 rounded-2xl bg-accent px-4 text-base font-medium text-paper disabled:opacity-60"
          >
            {pending ? "Activando…" : "Activar avisos"}
          </button>
        </>
      ) : null}
    </section>
  );
}

function subscribePushGate(): () => void {
  return () => {};
}

function readPushGate(): PushGate {
  if (process.env.NODE_ENV === "development") {
    return HIDDEN;
  }
  if (!readFirebasePublicConfig()) {
    return HIDDEN;
  }
  if (!("serviceWorker" in navigator) || !("Notification" in window) || !("PushManager" in window)) {
    return HIDDEN;
  }
  return Notification.permission;
}

async function activate(config: FirebasePublicConfig): Promise<boolean> {
  try {
    const token = await subscribeDevice(config);
    writeDeviceToken(token);
    const saved = await registerDeviceToken(token);
    return saved.ok;
  } catch {
    return false;
  }
}
