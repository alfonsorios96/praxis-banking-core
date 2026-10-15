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
      <div className="min-w-0">
        <p className="truncate text-base font-medium text-ink">{displayName}</p>
        <p className="text-sm text-muted" title={`Versión ${version}`}>
          {version.slice(0, 7)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="min-w-0 text-right">
          <p className="max-w-28 truncate text-sm text-ink" title={username}>
            {username}
          </p>
          <p className="text-sm text-muted">{roleLabel(role)}</p>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
