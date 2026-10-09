import type { Metadata } from "next";
import { listOwnedAccounts, listTransferRecipients } from "@/accounts/queries";
import type { OwnedAccount, TransferRecipient } from "@/accounts/types";
import { ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { requireRole } from "@/auth/guard";
import { listHolderTransfers, type TransferHistoryRow } from "@/transfers/history";
import { TransferForm } from "./transfer-form";

export const metadata: Metadata = { title: "Transferencias" };

export default async function TransferenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ hecha?: string }>;
}) {
  const session = await requireRole(ROLE_CUENTAHABIENTE);
  const { hecha } = await searchParams;
  const data = await loadTransfers(session.userId);

  if (!data) {
    return (
      <section className="flex flex-col gap-3">
        <h1 className="font-display text-4xl tracking-tight text-ink">Transferencias</h1>
        <p className="text-base leading-7 text-muted">
          No se pudieron cargar las transferencias. Revisa la conexión a MongoDB.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl tracking-tight text-ink">Transferencias</h1>
        <p className="text-base leading-7 text-muted">
          El dinero sale de un IBAN tuyo y entra al IBAN de la corriente de otro cuentahabiente.
          Nada se mueve hasta que confirmas.
        </p>
      </div>
      {hecha === "1" ? (
        <p className="text-sm text-accent" role="status">
          La transferencia quedó hecha.
        </p>
      ) : null}
      {data.accounts.length === 0 ? (
        <p className="text-base leading-7 text-muted">Todavía no hay cuentas abiertas a tu nombre.</p>
      ) : data.recipients.length === 0 ? (
        <p className="text-base leading-7 text-muted">No hay otro cuentahabiente para transferir.</p>
      ) : (
        <TransferForm accounts={data.accounts} recipients={data.recipients} />
      )}
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-2xl tracking-tight text-ink">Movimientos</h2>
        {data.history.length === 0 ? (
          <p className="text-base leading-7 text-muted">Todavía no hay transferencias.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {data.history.map((row) => (
              <li key={row.id} className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                <p className="text-base text-ink">{row.title}</p>
                <p className="text-sm text-muted">{row.detail}</p>
                <p className="mt-2 font-display text-2xl tracking-tight text-ink">{row.amountLabel}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

async function loadTransfers(userId: string): Promise<{
  accounts: OwnedAccount[];
  recipients: TransferRecipient[];
  history: TransferHistoryRow[];
} | null> {
  try {
    const [accounts, recipients, history] = await Promise.all([
      listOwnedAccounts(userId),
      listTransferRecipients(userId),
      listHolderTransfers(userId),
    ]);
    return { accounts, recipients, history };
  } catch (error) {
    console.error("[praxis] transferencias", error instanceof Error ? error.message : "error");
    return null;
  }
}
