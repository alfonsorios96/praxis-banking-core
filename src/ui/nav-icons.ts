import {
  Activity,
  ArrowLeftRight,
  CreditCard,
  House,
  Landmark,
  Receipt,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { AppPath } from "@/auth/access";

export const NAV_ICONS: Record<AppPath, LucideIcon> = {
  "/": House,
  "/cuentas": Landmark,
  "/tarjetas": CreditCard,
  "/transferencias": ArrowLeftRight,
  "/pagos": Receipt,
  "/monitoreo": Activity,
  "/configuracion": Settings,
};

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
