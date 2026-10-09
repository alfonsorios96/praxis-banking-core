"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  CreditCard,
  House,
  Landmark,
  Receipt,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { labelForPath, pathsForRole, type AppPath } from "@/auth/access";
import type { UserRole } from "@/domain/schemas";

const ICONS: Record<AppPath, LucideIcon> = {
  "/": House,
  "/cuentas": Landmark,
  "/tarjetas": CreditCard,
  "/transferencias": ArrowLeftRight,
  "/pagos": Receipt,
  "/configuracion": Settings,
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const tabs = pathsForRole(role);

  return (
    <nav
      aria-label="Secciones"
      className="shrink-0 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((href) => {
          const active = isActive(pathname, href);
          const Icon = ICONS[href];
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[10px] leading-none tracking-tight ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <Icon strokeWidth={1.75} className="size-5" aria-hidden />
                <span>{labelForPath(href)}</span>
                <span
                  className={`h-0.5 w-4 rounded-full ${active ? "bg-gold" : "bg-transparent"}`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
