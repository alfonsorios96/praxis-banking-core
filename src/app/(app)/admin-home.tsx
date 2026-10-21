import Link from "next/link";
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
        <h1 className="text-3xl font-medium tracking-tight text-ink">Inicio</h1>
        <p className="text-base leading-6 text-muted">
          No se pudo cargar el panel. Revisa la conexión a MongoDB.
        </p>
      </section>
    );
  }

  const readyCount = MODULES.filter((module) => module.ready).length;

  return (
    <section className="flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-medium tracking-tight text-ink">Inicio</h1>
        <p className="text-base leading-6 text-muted">Quién entra y qué está listo.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-white">
          <div className="bg-accent px-6 py-6 text-on-accent">
            <p className="text-5xl font-medium tracking-tight tabular-nums">{counts.holders}</p>
            <p className="mt-1 text-sm text-on-accent/80">Cuentahabientes</p>
          </div>
          <div className="flex items-baseline justify-between gap-3 px-6 py-4">
            <p className="text-sm text-muted">Administradores</p>
            <p className="text-2xl font-medium tracking-tight text-ink tabular-nums">
              {counts.admins}
            </p>
          </div>
          <div className="mt-auto border-t border-line px-6 py-4">
            <Link href="/monitoreo" className="btn-quiet -mx-2">
              Ver fallos en Monitoring
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-line bg-white p-6 lg:col-span-2">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="section-title">Módulos</h2>
            <p className="text-sm text-muted">
              {readyCount} de {MODULES.length} activos
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            {MODULES.map((module) => (
              <li
                key={module.name}
                className="flex min-h-12 items-center justify-between gap-3 border-b border-line"
              >
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
