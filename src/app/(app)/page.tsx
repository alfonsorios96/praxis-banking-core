import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AGENT_MISSIONS, SUBAGENTS } from "@/agents";
import { ROLE_ADMINISTRADOR } from "@/auth/constants";
import { verifySession } from "@/auth/dal";
import { AdminHome } from "./admin-home";

export const metadata: Metadata = {
  title: "Inicio",
};

export default async function HomePage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  if (session.role === ROLE_ADMINISTRADOR) {
    return <AdminHome />;
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-[0.18em] text-gold uppercase">
          Core bancario
        </p>
        <h1 className="font-display text-4xl tracking-tight text-ink">
          Hola, {session.username}
        </h1>
        <p className="text-base leading-7 text-muted">
          Tienes una corriente y una de ahorro, cada una con su IBAN. Una transferencia
          interna mueve euros cuando la confirmas. Tarjetas y pagos siguen en espera.
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {SUBAGENTS.map((name) => (
          <li
            key={name}
            className="rounded-2xl border border-line bg-white/70 px-4 py-3"
          >
            <p className="text-sm font-medium text-ink">{name}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{AGENT_MISSIONS[name]}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
