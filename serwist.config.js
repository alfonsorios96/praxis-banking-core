// @ts-check
import { existsSync, readFileSync } from "node:fs";
import { serwist } from "@serwist/next/config";

loadEnvFile(".env");
loadEnvFile(".env.local");

const publicKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_FIREBASE_VAPID_KEY",
];

/** @type {Record<string, string>} */
const define = {};
for (const key of publicKeys) {
  define[`process.env.${key}`] = JSON.stringify(process.env[key] ?? "");
}

export default serwist({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  esbuildOptions: { define },
});

/**
 * @param {string} path
 */
function loadEnvFile(path) {
  if (!existsSync(path)) {
    return;
  }
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}
