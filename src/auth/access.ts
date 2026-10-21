import type { UserRole } from "@/domain/schemas";
import { ROLE_ADMINISTRADOR, ROLE_CUENTAHABIENTE } from "./constants";

export const ADMIN_PATHS = ["/", "/monitoreo", "/configuracion"] as const;
export const HOLDER_PATHS = [
  "/",
  "/cuentas",
  "/tarjetas",
  "/transferencias",
  "/pagos",
] as const;

export type AppPath = (typeof ADMIN_PATHS)[number] | (typeof HOLDER_PATHS)[number];

const LABELS: Record<AppPath, string> = {
  "/": "Inicio",
  "/cuentas": "Cuentas",
  "/tarjetas": "Tarjetas",
  "/transferencias": "Transferencias",
  "/pagos": "Pagos",
  "/monitoreo": "Monitoring",
  "/configuracion": "Configuración",
};

export function pathsForRole(role: UserRole): readonly AppPath[] {
  switch (role) {
    case ROLE_ADMINISTRADOR:
      return ADMIN_PATHS;
    case ROLE_CUENTAHABIENTE:
      return HOLDER_PATHS;
  }
}

export function visiblePaths(role: UserRole, hidden: readonly string[]): readonly AppPath[] {
  return pathsForRole(role).filter((path) => !hidden.includes(path));
}

export function labelForPath(path: AppPath): string {
  return LABELS[path];
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case ROLE_ADMINISTRADOR:
      return "Administrador";
    case ROLE_CUENTAHABIENTE:
      return "Cuentahabiente";
  }
}

export function canAccessPath(role: UserRole, pathname: string): boolean {
  return pathsForRole(role).some((path) => matchesPath(pathname, path));
}

export function landingPath(role: UserRole, requested: string): string {
  if (
    !requested.startsWith("/") ||
    requested.startsWith("//") ||
    requested.startsWith("/login")
  ) {
    return "/";
  }
  return canAccessPath(role, requested) ? requested : "/";
}

function matchesPath(pathname: string, path: string): boolean {
  if (path === "/") {
    return pathname === "/";
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}
