import { logout } from "@/app/actions/auth";
import { roleLabel } from "@/auth/access";
import type { UserRole } from "@/domain/schemas";

export function AppHeader({
  username,
  role,
  displayName,
}: {
  username: string;
  role: UserRole;
  displayName: string;
}) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
      <p className="min-w-0 truncate font-display text-2xl tracking-tight text-ink">
        {displayName}
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex min-w-0 flex-col items-end">
          <span className="max-w-28 truncate text-sm text-ink" title={username}>
            {username}
          </span>
          <span className="text-[10px] tracking-[0.14em] text-gold uppercase">
            {roleLabel(role)}
          </span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="min-h-11 px-2 text-sm font-medium text-accent"
          >
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
