"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  CreditCard,
  House,
  Landmark,
  Receipt,
} from "lucide-react";

const TABS = [
  { href: "/", label: "Inicio", icon: House },
  { href: "/cuentas", label: "Cuentas", icon: Landmark },
  { href: "/tarjetas", label: "Tarjetas", icon: CreditCard },
  { href: "/transferencias", label: "Transferencias", icon: ArrowLeftRight },
  { href: "/pagos", label: "Pagos", icon: Receipt },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones"
      className="shrink-0 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
          const Icon = tab.icon;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[10px] leading-none tracking-tight ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <Icon strokeWidth={1.75} className="size-5" aria-hidden />
                <span>{tab.label}</span>
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
