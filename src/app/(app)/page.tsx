import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { listOwnedAccounts } from "@/accounts/queries";
import type { OwnedAccount } from "@/accounts/types";
import { ROLE_ADMINISTRADOR } from "@/auth/constants";
import { verifySession } from "@/auth/dal";
import { moduleEnabled } from "@/auth/guard";
import { AccountList } from "@/ui/account-list";
import { PushOptIn } from "@/ui/push-opt-in";
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

  const accounts = await loadAccounts(session.userId);
  if (!accounts) {
    return (
      <section className="flex flex-col gap-3">
        <h1 className="screen-title">Inicio</h1>
        <p className="text-base leading-6 text-muted">
          No se pudieron cargar las cuentas. Revisa la conexión a MongoDB.
        </p>
      </section>
    );
  }

  const canTransfer = await moduleEnabled(session.userId, "transfers");

  return (
    <section className="flex flex-col gap-8">
      <h1 className="screen-title">Hola, {session.username}</h1>
      <AccountList accounts={accounts} />
      {canTransfer ? (
        <Link href="/transferencias" className="btn-primary">
          Transferir
        </Link>
      ) : null}
      <PushOptIn username={session.username} />
    </section>
  );
}

async function loadAccounts(userId: string): Promise<OwnedAccount[] | null> {
  try {
    return await listOwnedAccounts(userId);
  } catch (error) {
    console.error("[praxis] inicio", error instanceof Error ? error.message : "error");
    return null;
  }
}
