import type { Metadata } from "next";
import { ROLE_ADMINISTRADOR, ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { roleLabel } from "@/auth/access";
import { requireRole } from "@/auth/guard";
import { listPeople, platformDisplayName, type DirectoryPerson } from "@/db/directory";
import { connectDb } from "@/db/connect";
import { MODULE_KEYS, MODULE_LABEL, type ModuleState } from "@/modules/keys";
import { readModuleStates } from "@/modules/store";
import { ModulesForm } from "./modules-form";
import { SettingsForm } from "./settings-form";

const CANARY_STEPS = [
  {
    stage: "Canario",
    text: "Se activa a una sola persona. Si algo falla, solo lo nota ella.",
  },
  {
    stage: "Parcial",
    text: "Si va bien, se amplía a más personas y se sigue observando.",
  },
  {
    stage: "Todos",
    text: "Al final lo tiene todo el mundo. Desactivar en cualquier paso es el rollback.",
  },
] as const;

export const metadata: Metadata = { title: "Configuración" };

export default async function ConfiguracionPage() {
  await requireRole(ROLE_ADMINISTRADOR);
  const data = await loadConfiguration();

  if (!data) {
    return (
      <section className="flex flex-col gap-3">
        <h1 className="screen-title">Configuración</h1>
        <p className="text-base leading-6 text-muted">
          No se pudo cargar la configuración. Revisa la conexión a MongoDB.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="screen-title">Configuración</h1>
        <p className="text-base leading-6 text-muted">
          El nombre aparece en la cabecera. Los módulos se abren a pocas personas antes que a
          todas.
        </p>
      </div>

      <SettingsForm displayName={data.displayName} />

      <div className="flex flex-col gap-3">
        <h2 className="section-title">Módulos</h2>
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <h3 className="text-base font-medium text-ink">Qué es un canary release</h3>
          <p className="text-sm leading-6 text-muted">
            Una función nueva no llega a todos a la vez. Como el canario de las minas, unos pocos
            la prueban primero y avisan si algo va mal.
          </p>
          <ol className="flex flex-col gap-3">
            {CANARY_STEPS.map((step, index) => (
              <li key={step.stage} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-medium text-on-accent">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-muted">
                  <span className="font-medium text-ink">{step.stage}.</span> {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
        <p className="text-sm leading-6 text-muted">
          Marca personas y activa o desactiva el módulo. Solo cambia quien marcas, y le llega
          un aviso a sus dispositivos. La barra muestra quién lo tiene.
        </p>
        {data.modules ? (
          MODULE_KEYS.map((key) => (
            <ModulesForm
              key={key}
              moduleKey={key}
              label={MODULE_LABEL[key]}
              holders={data.holders.map((holder) => ({
                id: holder.id,
                username: holder.username,
                fullName: holder.fullName,
                enabled: data.modules?.get(holder.id)?.[key] ?? true,
              }))}
            />
          ))
        ) : (
          <p className="text-sm leading-6 text-muted">No se pudieron leer los módulos.</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="section-title">Personas</h2>
        {data.people.length === 0 ? (
          <p className="text-sm leading-6 text-muted">Todavía no hay personas.</p>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {data.people.map((person) => {
              const title = person.fullName || person.username;
              return (
                <li key={person.username} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-base text-ink">{title}</p>
                    {person.fullName ? (
                      <p className="truncate text-sm text-muted">{person.username}</p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-sm text-muted">{roleLabel(person.role)}</p>
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
  modules: Map<string, ModuleState> | null;
} | null> {
  try {
    await connectDb();
    const [displayName, people] = await Promise.all([platformDisplayName(), listPeople()]);
    const holders = people.filter((person) => person.role === ROLE_CUENTAHABIENTE);
    return {
      displayName,
      people,
      holders,
      modules: await loadModules(holders.map((holder) => holder.id)),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function loadModules(holderIds: string[]) {
  try {
    return await readModuleStates(holderIds);
  } catch (error) {
    console.error(error);
    return null;
  }
}
