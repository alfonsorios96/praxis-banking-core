import type { Metadata } from "next";
import { ROLE_ADMINISTRADOR, ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { roleLabel } from "@/auth/access";
import { requireRole } from "@/auth/guard";
import { listPeople, platformDisplayName, type DirectoryPerson } from "@/db/directory";
import { connectDb } from "@/db/connect";
import { eligibleHolderCount } from "@/releases/cohort";
import { readCurrentRelease, type StoredRelease } from "@/releases/store";
import { ReleaseForm } from "./release-form";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Configuración" };

export default async function ConfiguracionPage() {
  await requireRole(ROLE_ADMINISTRADOR);
  const data = await loadConfiguration();

  if (!data) {
    return (
      <section className="flex flex-col gap-3">
        <h1 className="font-display text-4xl tracking-tight text-ink">Configuración</h1>
        <p className="text-base leading-7 text-muted">
          No se pudo cargar la configuración. Revisa la conexión a MongoDB.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-[0.18em] text-gold uppercase">
          Administración
        </p>
        <h1 className="font-display text-4xl tracking-tight text-ink">Configuración</h1>
        <p className="text-base leading-7 text-muted">
          El nombre visible aparece en la cabecera. Aquí también se abre la versión
          actual: por porcentaje, por fecha o para cuentahabientes concretos.
        </p>
      </div>

      <SettingsForm displayName={data.displayName} />

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-3xl tracking-tight text-ink">Versión</h2>
        {data.release ? (
          <ReleaseForm
            key={data.release.revision}
            buildId={data.release.buildId}
            percent={data.release.percent}
            allowUserIds={data.release.allowUserIds}
            steps={data.release.steps}
            holders={data.holders}
            eligibleHolders={data.release.eligibleHolders}
            holderCount={data.holders.length}
          />
        ) : (
          <p className="text-sm leading-6 text-muted">
            No se pudo leer la release de este build.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-ink">Personas</h2>
        {data.people.length === 0 ? (
          <p className="text-sm leading-6 text-muted">Todavía no hay personas.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {data.people.map((person) => {
              const title = person.fullName || person.username;
              return (
                <li
                  key={person.username}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white/70 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{title}</p>
                    {person.fullName ? (
                      <p className="truncate text-sm text-muted">{person.username}</p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-[10px] tracking-[0.14em] text-gold uppercase">
                    {roleLabel(person.role)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

async function loadConfiguration(): Promise<{
  displayName: string;
  people: DirectoryPerson[];
  holders: DirectoryPerson[];
  release: {
    revision: string;
    buildId: string;
    percent: number;
    allowUserIds: string[];
    steps: { at: string; percent: number }[];
    eligibleHolders: number;
  } | null;
} | null> {
  try {
    await connectDb();
    const [displayName, people, release] = await Promise.all([
      platformDisplayName(),
      listPeople(),
      readCurrentRelease(),
    ]);
    const holders = people.filter((person) => person.role === ROLE_CUENTAHABIENTE);
    return {
      displayName,
      people,
      holders,
      release: release ? presentRelease(release, holders.map((holder) => holder.id)) : null,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

function presentRelease(release: StoredRelease, holderIds: string[]) {
  const steps = release.steps.map((step) => ({
    at: step.at.toISOString(),
    percent: step.percent,
  }));
  return {
    revision: `${release.buildId}:${release.percent}:${release.allowUserIds.join(",")}:${steps.map((step) => `${step.at}:${step.percent}`).join("|")}`,
    buildId: release.buildId,
    percent: release.percent,
    allowUserIds: release.allowUserIds,
    steps,
    eligibleHolders: eligibleHolderCount(
      holderIds,
      {
        releaseId: release.buildId,
        percent: release.percent,
        steps: release.steps,
        allowUserIds: release.allowUserIds,
      },
      new Date(),
    ),
  };
}
