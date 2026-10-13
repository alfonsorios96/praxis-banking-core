export type FirebaseAdminCredentials = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

export type FirebasePublicConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
};

type Env = Record<string, string | undefined>;

export function readFirebaseAdminCredentials(env: Env = process.env): FirebaseAdminCredentials | null {
  const projectId = clean(env.FIREBASE_PROJECT_ID);
  const clientEmail = clean(env.FIREBASE_CLIENT_EMAIL);
  const privateKey = clean(env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }
  return { projectId, clientEmail, privateKey };
}

export function readFirebasePublicConfig(env?: Env): FirebasePublicConfig | null {
  const source = env ?? {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  };
  const config = {
    apiKey: clean(source.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: clean(source.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: clean(source.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    messagingSenderId: clean(source.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: clean(source.NEXT_PUBLIC_FIREBASE_APP_ID),
    vapidKey: clean(source.NEXT_PUBLIC_FIREBASE_VAPID_KEY),
  };
  if (Object.values(config).some((value) => value.length === 0)) {
    return null;
  }
  return config;
}

function clean(value: string | undefined): string {
  if (typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}
