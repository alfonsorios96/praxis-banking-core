"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_PATHS, labelForPath } from "@/auth/access";
import { LogoutButton } from "./logout-button";
import { isActivePath, NAV_ICONS } from "./nav-icons";

export function AdminShell({
  children,
  displayName,
  username,
}: {
  children: React.ReactNode;
  displayName: string;
  username: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-paper md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="border-b border-line bg-white md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 md:block md:pt-7 md:pb-6">
          <div className="min-w-0">
            <p className="truncate text-lg font-medium tracking-tight text-ink">{displayName}</p>
            <p className="text-sm text-muted">Administración</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <p className="max-w-32 truncate text-sm text-muted" title={username}>
              {username}
            </p>
            <LogoutButton />
          </div>
        </div>
        <nav aria-label="Secciones" className="px-3 pb-3 md:flex-1 md:pb-0">
          <ul className="flex gap-1 overflow-x-auto md:flex-col">
            {ADMIN_PATHS.map((href) => {
              const active = isActivePath(pathname, href);
              const Icon = NAV_ICONS[href];
              return (
                <li key={href} className="shrink-0">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      active ? "bg-accent/10 text-accent" : "text-muted hover:bg-paper hover:text-ink"
                    }`}
                  >
                    <Icon strokeWidth={1.75} className="size-[1.125rem]" aria-hidden />
                    {labelForPath(href)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="hidden items-center justify-between gap-2 border-t border-line px-6 py-4 md:flex">
          <div className="min-w-0">
            <p className="truncate text-sm text-ink" title={username}>
              {username}
            </p>
            <p className="text-sm text-muted">Administrador</p>
          </div>
          <LogoutButton />
        </div>
      </aside>
      <main className="w-full min-w-0 max-w-6xl px-6 py-8 md:px-12 md:py-12">{children}</main>
    </div>
  );
}
