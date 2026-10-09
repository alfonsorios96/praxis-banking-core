import { logout } from "@/app/actions/auth";

export function AppHeader({ username }: { username: string }) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
      <p className="font-display text-2xl tracking-tight text-ink">Praxis</p>
      <div className="flex min-w-0 items-center gap-2">
        <span className="max-w-28 truncate text-sm text-muted" title={username}>
          {username}
        </span>
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
