import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { TRANSFER_PUSH_PATH, TRANSFER_PUSH_TITLE } from "./constants";
import type { FirebasePublicConfig } from "./credentials";

export type ForegroundPush = {
  title: string;
  body: string;
  url: string;
};

const SW_READY_MS = 8000;

export async function subscribeDevice(config: FirebasePublicConfig): Promise<string> {
  const registration = await waitForWorker();
  const token = await getToken(getMessaging(praxisApp(config)), {
    vapidKey: config.vapidKey,
    serviceWorkerRegistration: registration,
  });
  if (!token) {
    throw new Error("empty-token");
  }
  return token;
}

export function listenForeground(
  config: FirebasePublicConfig,
  onPush: (message: ForegroundPush) => void,
): () => void {
  return onMessage(getMessaging(praxisApp(config)), (payload) => {
    onPush({
      title: payload.data?.title || TRANSFER_PUSH_TITLE,
      body: payload.data?.body || "",
      url: safePath(payload.data?.url),
    });
  });
}

function praxisApp(config: FirebasePublicConfig): FirebaseApp {
  const existing = getApps().find((app) => app.name === "praxis");
  if (existing) {
    return existing;
  }
  return initializeApp(
    {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    },
    "praxis",
  );
}

function waitForWorker(): Promise<ServiceWorkerRegistration> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("sw")), SW_READY_MS);
    navigator.serviceWorker.ready.then(
      (registration) => {
        window.clearTimeout(timeout);
        resolve(registration);
      },
      (error: unknown) => {
        window.clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

function safePath(url: string | undefined): string {
  if (url && url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }
  return TRANSFER_PUSH_PATH;
}
