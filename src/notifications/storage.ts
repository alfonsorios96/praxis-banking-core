import { DEVICE_TOKEN_STORAGE_KEY, PUSH_PROMPT_SEEN_PREFIX } from "./constants";

export function readDeviceToken(): string {
  try {
    return window.localStorage.getItem(DEVICE_TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeDeviceToken(token: string): void {
  try {
    window.localStorage.setItem(DEVICE_TOKEN_STORAGE_KEY, token);
  } catch {
    // El servidor guarda el token. Si el navegador bloquea el almacenamiento, el alta igual se intentó.
  }
}

export function clearDeviceToken(): void {
  try {
    window.localStorage.removeItem(DEVICE_TOKEN_STORAGE_KEY);
  } catch {
    // No queda nada local que borrar.
  }
}

export function pushPromptSeenKey(username: string): string {
  return `${PUSH_PROMPT_SEEN_PREFIX}${username}`;
}

export function hasSeenPushPrompt(username: string): boolean {
  try {
    return window.localStorage.getItem(pushPromptSeenKey(username)) === "1";
  } catch {
    return false;
  }
}

export function rememberPushPrompt(username: string): void {
  try {
    window.localStorage.setItem(pushPromptSeenKey(username), "1");
  } catch {
    // Si el navegador no guarda, el aviso puede volver a salir al recargar.
  }
}
