import type { Metadata } from "next";
import { ROLE_ADMINISTRADOR } from "@/auth/constants";
import { requireRole } from "@/auth/guard";
import { minuteBuckets, pieSlices, TIMELINE_MINUTES } from "@/monitoring/faults";
import { readMonitoring, type MonitoringSnapshot } from "@/monitoring/queries";
import { AutoRefresh } from "./auto-refresh";
import { FaultPie, TimelineChart } from "./charts";
import { formatClock, formatClockSeconds } from "./format";
import { SimulationForm } from "./simulation-form";

export const metadata: Metadata = { title: "Monitoring" };

const REFRESH_SECONDS = 10;

export default async function MonitoreoPage() {
  await requireRole(ROLE_ADMINISTRADOR);
  const snapshot = await loadSnapshot();

  if (!snapshot) {
    return (
      <section className="flex flex-col gap-3">
        <h1 className="screen-title">Monitoring</h1>
        <p className="text-base leading-6 text-muted">
          No se pudo cargar Monitoring. Revisa la conexión a MongoDB.
        </p>
      </section>
    );
  }

  const buckets = minuteBuckets(snapshot.windowTimes, snapshot.now);
  const slices = pieSlices(snapshot.concepts);
  const lastIncident = snapshot.recent[0];

  return (
    <section className="flex flex-col gap-8">
      <AutoRefresh seconds={REFRESH_SECONDS} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-medium tracking-tight text-ink">Monitoring</h1>
          <p className="text-base leading-6 text-muted">
            Fallos de la emisión de tarjetas digitales.
          </p>
        </div>
        <p className="text-sm text-muted">
          Actualizado a las {formatClockSeconds(snapshot.now)}. Se refresca cada {REFRESH_SECONDS}{" "}
          segundos.
        </p>
      </div>

      <dl className="grid grid-cols-1 divide-y divide-line rounded-xl border border-line bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="px-6 py-5">
          <dt className="text-sm text-muted">Fallos registrados</dt>
          <dd className="mt-1 text-4xl font-medium tracking-tight text-ink tabular-nums">
            {snapshot.total}
          </dd>
        </div>
        <div className="px-6 py-5">
          <dt className="text-sm text-muted">Últimos {TIMELINE_MINUTES} minutos</dt>
          <dd
            className={`mt-1 text-4xl font-medium tracking-tight tabular-nums ${
              snapshot.windowTimes.length > 0 ? "text-danger" : "text-ink"
            }`}
          >
            {snapshot.windowTimes.length}
          </dd>
        </div>
        <div className="px-6 py-5">
          <dt className="text-sm text-muted">Último fallo</dt>
          <dd className="mt-1 text-4xl font-medium tracking-tight text-ink tabular-nums">
            {lastIncident ? formatClock(lastIncident.at) : "Ninguno"}
          </dd>
        </div>
      </dl>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 rounded-xl border border-line bg-white p-6">
          <div className="flex flex-col gap-1">
            <h2 className="section-title">Fallos por minuto</h2>
            <p className="text-sm text-muted">Últimos {TIMELINE_MINUTES} minutos, hora de Madrid.</p>
          </div>
          <TimelineChart buckets={buckets} />
        </div>
        <div className="flex flex-col gap-4 rounded-xl border border-line bg-white p-6">
          <div className="flex flex-col gap-1">
            <h2 className="section-title">Por concepto</h2>
            <p className="text-sm text-muted">Todos los fallos registrados.</p>
          </div>
          <FaultPie slices={slices} total={snapshot.total} />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 rounded-xl border border-line bg-white p-6">
          <h2 className="section-title">Fallos recientes</h2>
          {snapshot.recent.length === 0 ? (
            <p className="text-sm text-muted">
              Todavía no hay fallos. Aparecen cuando una emisión digital devuelve un error.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-muted">
                <tr className="border-b border-line">
                  <th scope="col" className="py-2 pr-4 font-normal">
                    Hora
                  </th>
                  <th scope="col" className="py-2 pr-4 font-normal">
                    Código
                  </th>
                  <th scope="col" className="py-2 font-normal">
                    Concepto
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {snapshot.recent.map((incident) => (
                  <tr key={incident.id}>
                    <td className="py-2.5 pr-4 text-ink tabular-nums">
                      {formatClockSeconds(incident.at)}
                    </td>
                    <td className="py-2.5 pr-4 font-medium text-danger tabular-nums">
                      {incident.code}
                    </td>
                    <td className="py-2.5 text-ink">{incident.concept}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex flex-col gap-4 rounded-xl border border-line bg-white p-6">
          <h2 className="section-title">Simulación</h2>
          <p className="text-sm leading-6 text-muted">
            Fallos inventados para la demo. Al apagarla, los cuentahabientes vuelven a crear sus
            tarjetas digitales sin errores.
          </p>
          <SimulationForm simulating={snapshot.simulating} />
        </div>
      </div>
    </section>
  );
}

async function loadSnapshot(): Promise<MonitoringSnapshot | null> {
  try {
    return await readMonitoring();
  } catch (error) {
    console.error(error);
    return null;
  }
}
