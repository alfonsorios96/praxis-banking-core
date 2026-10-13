import { DEVICE_TOKEN_STORAGE_KEY } from "./constants";

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
