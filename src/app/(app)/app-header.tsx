import { roleLabel } from "@/auth/access";
import type { UserRole } from "@/domain/schemas";
import { LogoutButton } from "@/ui/logout-button";

export function AppHeader({
  username,
  role,
  displayName,
  version,
}: {
  username: string;
  role: UserRole;
  displayName: string;
  version: string;
}) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
      <div className="flex min-w-0 items-center gap-2">
        <p className="min-w-0 truncate font-display text-2xl tracking-tight text-ink">
          {displayName}
        </p>
        <span
          className="shrink-0 rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-muted"
          title={`Versión ${version}`}
        >
          {version.slice(0, 7)}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex min-w-0 flex-col items-end">
          <span className="max-w-28 truncate text-sm text-ink" title={username}>
            {username}
          </span>
          <span className="text-[10px] tracking-[0.14em] text-gold uppercase">
            {roleLabel(role)}
          </span>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
