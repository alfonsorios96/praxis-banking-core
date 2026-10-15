import type { Metadata } from "next";
import { listOwnedAccounts } from "@/accounts/queries";
import type { OwnedAccount } from "@/accounts/types";
import { ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { requireRole } from "@/auth/guard";
import { AccountList } from "@/ui/account-list";

export const metadata: Metadata = { title: "Cuentas" };

export default async function CuentasPage() {
  const session = await requireRole(ROLE_CUENTAHABIENTE);
  const accounts = await loadAccounts(session.userId);

  if (!accounts) {
    return (
      <section className="flex flex-col gap-3">
        <h1 className="screen-title">Cuentas</h1>
        <p className="text-base leading-6 text-muted">
          No se pudieron cargar las cuentas. Revisa la conexión a MongoDB.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="screen-title">Cuentas</h1>
        <p className="text-base leading-6 text-muted">El saldo sale del ledger.</p>
      </div>
      <AccountList accounts={accounts} />
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
