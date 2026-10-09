export const SESSION_COOKIE = "praxis_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export const ROLE_ADMINISTRADOR = "administrador" as const;
export const ROLE_CUENTAHABIENTE = "cuentahabiente" as const;

export const PUBLIC_PATHS = [
  "/login",
  "/api/health",
  "/manifest.webmanifest",
  "/sw.js",
] as const;

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
