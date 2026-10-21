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
        <h1 className="text-3xl font-medium tracking-tight text-ink">Configuración</h1>
        <p className="text-base leading-6 text-muted">
          No se pudo cargar la configuración. Revisa la conexión a MongoDB.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-medium tracking-tight text-ink">Configuración</h1>
        <p className="text-base leading-6 text-muted">
          El nombre aparece en la cabecera. Los módulos se abren a pocas personas antes que a
          todas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-xl border border-line bg-white p-6">
          <h2 className="section-title">Plataforma</h2>
          <SettingsForm displayName={data.displayName} />
        </div>
        <div className="flex flex-col gap-4 rounded-xl border border-line bg-white p-6 lg:col-span-2">
          <h2 className="section-title">Qué es un canary release</h2>
          <p className="text-sm leading-6 text-muted">
            Una función nueva no llega a todos a la vez. Como el canario de las minas, unos pocos
            la prueban primero y avisan si algo va mal.
          </p>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="section-title">Módulos</h2>
          <p className="text-sm leading-6 text-muted">
            Marca personas y activa o desactiva el módulo. Solo cambia quien marcas, y le llega un
            aviso a sus dispositivos. La barra muestra quién lo tiene.
          </p>
        </div>
        {data.modules ? (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            {MODULE_KEYS.map((key) => (
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
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted">No se pudieron leer los módulos.</p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="section-title">Personas</h2>
        {data.people.length === 0 ? (
          <p className="text-sm leading-6 text-muted">Todavía no hay personas.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-white">
            <table className="w-full text-left text-sm">
              <thead className="text-muted">
                <tr className="border-b border-line">
                  <th scope="col" className="px-6 py-3 font-normal">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 font-normal">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3 font-normal">
                    Rol
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.people.map((person) => (
                  <tr key={person.username}>
                    <td className="px-6 py-3 text-ink">{person.fullName || person.username}</td>
                    <td className="px-6 py-3 text-muted">{person.username}</td>
                    <td className="px-6 py-3 text-muted">{roleLabel(person.role)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
