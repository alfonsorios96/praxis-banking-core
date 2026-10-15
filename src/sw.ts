/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import { getApps, initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { TRANSFER_PUSH_PATH, TRANSFER_PUSH_TITLE } from "./notifications/constants";
import { readFirebasePublicConfig } from "./notifications/credentials";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(notificationPath(event.notification.data), self.location.origin).href;
  event.waitUntil(openNotification(target));
});

try {
  const config = readFirebasePublicConfig();
  if (config) {
    const firebaseApp =
      getApps()[0] ??
      initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
      });
    const messaging = getMessaging(firebaseApp);
    onBackgroundMessage(messaging, (payload) => {
      const title = payload.data?.title || TRANSFER_PUSH_TITLE;
      const body = payload.data?.body || "";
      return self.registration.showNotification(title, {
        body,
        icon: "/icons/icon-192.png",
        data: { url: notificationPath(payload.data?.url) },
      });
    });
  }
} catch {
  // Sin Firebase el precache sigue. El traspaso no depende del aviso.
}

serwist.addEventListeners();

function notificationPath(data: unknown): string {
  if (typeof data === "object" && data && "url" in data && typeof data.url === "string") {
    if (data.url.startsWith("/") && !data.url.startsWith("//")) {
      return data.url;
    }
  }
  if (typeof data === "string" && data.startsWith("/") && !data.startsWith("//")) {
    return data;
  }
  return TRANSFER_PUSH_PATH;
}

async function openNotification(target: string): Promise<void> {
  const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const client of windows) {
    if (client.type !== "window") {
      continue;
    }
    if (new URL(client.url).origin !== self.location.origin) {
      continue;
    }
    const windowClient = client as WindowClient;
    try {
      if (typeof windowClient.navigate === "function") {
        await windowClient.navigate(target);
      }
    } catch {
      // Si la navegación falla, la ventana abierta igual pasa a primer plano.
    }
    await windowClient.focus();
    return;
  }
  await self.clients.openWindow(target);
}
