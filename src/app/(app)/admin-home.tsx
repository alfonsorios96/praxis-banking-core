import { accessCounts } from "@/db/directory";

const MODULES = [
  { name: "Identidad", ready: true },
  { name: "Cuentas", ready: true },
  { name: "Tarjetas", ready: true },
  { name: "Transferencias", ready: true },
  { name: "Pagos", ready: false },
  { name: "Ledger", ready: true },
] as const;

export async function AdminHome() {
  const counts = await loadCounts();
  if (!counts) {
    return (
      <section className="flex flex-col gap-3">
        <h1 className="screen-title">Inicio</h1>
        <p className="text-base leading-6 text-muted">
          No se pudo cargar el panel. Revisa la conexión a MongoDB.
        </p>
      </section>
    );
  }

  const readyCount = MODULES.filter((module) => module.ready).length;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="screen-title">Inicio</h1>
        <p className="text-sm leading-6 text-muted">Quién entra y qué está listo.</p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white">
        <div className="bg-accent px-5 py-6 text-on-accent">
          <p className="text-5xl font-medium tracking-tight tabular-nums">{counts.holders}</p>
          <p className="mt-1 text-sm text-on-accent/80">Cuentahabientes</p>
        </div>
        <div className="flex items-baseline justify-between gap-3 px-5 py-4">
          <p className="text-sm text-muted">Administradores</p>
          <p className="text-2xl font-medium tracking-tight text-ink tabular-nums">{counts.admins}</p>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="section-title">Módulos</h2>
          <p className="text-sm text-muted">
            {readyCount} de {MODULES.length} activos
          </p>
        </div>
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl bg-white">
          {MODULES.map((module) => (
            <li key={module.name} className="flex min-h-12 items-center justify-between gap-3 px-4">
              <span className="text-base text-ink">{module.name}</span>
              <span className="inline-flex items-center gap-2 text-sm text-muted">
                <span
                  className={`size-1.5 rounded-full ${module.ready ? "bg-accent" : "border border-muted"}`}
                  aria-hidden
                />
                {module.ready ? "Activo" : "En espera"}
              </span>
            </li>
          ))}
        </ul>
      </div>
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
