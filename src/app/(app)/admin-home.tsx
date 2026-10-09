import { accessCounts } from "@/db/directory";

const MODULES = [
  { name: "Identidad", status: "Activo" },
  { name: "Cuentas", status: "Activo" },
  { name: "Tarjetas", status: "En espera" },
  { name: "Transferencias", status: "Activo" },
  { name: "Pagos", status: "En espera" },
  { name: "Ledger", status: "Activo" },
] as const;

export async function AdminHome() {
  const counts = await loadCounts();
  if (!counts) {
    return (
      <section className="flex flex-col gap-3">
        <h1 className="font-display text-4xl tracking-tight text-ink">Inicio</h1>
        <p className="text-base leading-7 text-muted">
          No se pudo cargar el panel. Revisa la conexión a MongoDB.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-[0.18em] text-gold uppercase">
          Administración
        </p>
        <h1 className="font-display text-4xl tracking-tight text-ink">Inicio</h1>
        <p className="text-base leading-7 text-muted">
          Panorama de quién entra y de qué módulos están listos. Aquí no hay
          saldos ni movimientos.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <article className="rounded-2xl border border-line bg-white/70 px-4 py-4">
          <p className="text-xs font-medium tracking-[0.14em] text-gold uppercase">
            Cuentahabientes
          </p>
          <p className="mt-2 font-display text-5xl tracking-tight text-ink">
            {counts.holders}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-white/70 px-4 py-4">
          <p className="text-xs font-medium tracking-[0.14em] text-gold uppercase">
            Administradores
          </p>
          <p className="mt-2 font-display text-5xl tracking-tight text-ink">
            {counts.admins}
          </p>
        </article>
      </div>

      <article className="rounded-2xl border border-line bg-white/70 px-4 py-3">
        <h2 className="text-sm font-medium text-ink">Módulos</h2>
        <ul className="mt-2 divide-y divide-line">
          {MODULES.map((module) => (
            <li key={module.name} className="flex items-center justify-between gap-3 py-3">
              <span className="text-sm text-ink">{module.name}</span>
              <span className="text-xs tracking-wide text-muted uppercase">
                {module.status}
              </span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

async function loadCounts(): Promise<{ holders: number; admins: number } | null> {
  try {
    return await accessCounts();
  } catch (error) {
    console.error(error);
    return null;
  }
}
