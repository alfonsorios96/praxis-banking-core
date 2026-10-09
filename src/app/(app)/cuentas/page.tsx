import type { Metadata } from "next";
import { listOwnedAccounts } from "@/accounts/queries";
import type { OwnedAccount } from "@/accounts/types";
import { ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { requireRole } from "@/auth/guard";

export const metadata: Metadata = { title: "Cuentas" };

export default async function CuentasPage() {
  const session = await requireRole(ROLE_CUENTAHABIENTE);
  const accounts = await loadAccounts(session.userId);

  if (!accounts) {
    return (
      <section className="flex flex-col gap-3">
        <h1 className="font-display text-4xl tracking-tight text-ink">Cuentas</h1>
        <p className="text-base leading-7 text-muted">
          No se pudieron cargar las cuentas. Revisa la conexión a MongoDB.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl tracking-tight text-ink">Cuentas</h1>
        <p className="text-base leading-7 text-muted">
          Corriente y Ahorro están abiertas a tu nombre, cada una con su IBAN. El saldo sale del ledger.
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {accounts.map((account) => (
          <li key={account.id} className="rounded-2xl border border-line bg-white/70 px-4 py-4">
            <p className="text-sm text-muted">{account.label}</p>
            <p className="mt-1 font-display text-4xl tracking-tight text-ink">{account.balanceLabel}</p>
            <p className="mt-2 text-sm break-all text-ink">{account.ibanLabel}</p>
            <p className="mt-2 text-sm text-muted">Abierta · EUR</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function loadAccounts(userId: string): Promise<OwnedAccount[] | null> {
  try {
    return await listOwnedAccounts(userId);
  } catch (error) {
    console.error("[praxis] cuentas", error instanceof Error ? error.message : "error");
    return null;
  }
}
