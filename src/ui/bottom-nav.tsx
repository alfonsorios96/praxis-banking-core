"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { labelForPath, visiblePaths } from "@/auth/access";
import type { UserRole } from "@/domain/schemas";
import { isActivePath, NAV_ICONS } from "./nav-icons";

export function BottomNav({ role, hidden }: { role: UserRole; hidden: readonly string[] }) {
  const pathname = usePathname();
  const tabs = visiblePaths(role, hidden);

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
          const active = isActivePath(pathname, href);
          const Icon = NAV_ICONS[href];
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <Icon strokeWidth={1.75} className="size-5" aria-hidden />
                <span>{labelForPath(href)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
