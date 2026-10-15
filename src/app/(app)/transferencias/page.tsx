import type { Metadata } from "next";
import { listOwnedAccounts, listTransferRecipients } from "@/accounts/queries";
import type { OwnedAccount, TransferRecipient } from "@/accounts/types";
import { requireModule } from "@/auth/guard";
import { listHolderTransfers, type TransferHistoryRow } from "@/transfers/history";
import { TransferForm } from "./transfer-form";

export const metadata: Metadata = { title: "Transferencias" };

export default async function TransferenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ hecha?: string }>;
}) {
  const session = await requireModule("transfers");
  const { hecha } = await searchParams;
  const data = await loadTransfers(session.userId);

  if (!data) {
    return (
      <section className="flex flex-col gap-3">
        <h1 className="screen-title">Transferencias</h1>
        <p className="text-base leading-6 text-muted">
          No se pudieron cargar las transferencias. Revisa la conexión a MongoDB.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="screen-title">Transferencias</h1>
        <p className="text-base leading-6 text-muted">Nada se mueve hasta que confirmas.</p>
      </div>
      {hecha === "1" ? (
        <p className="status" role="status">
          Transferencia confirmada.
        </p>
      ) : null}
      {data.accounts.length === 0 ? (
        <p className="text-base leading-6 text-muted">Todavía no hay cuentas abiertas a tu nombre.</p>
      ) : data.recipients.length === 0 ? (
        <p className="text-base leading-6 text-muted">No hay otro cuentahabiente para transferir.</p>
      ) : (
        <TransferForm accounts={data.accounts} recipients={data.recipients} />
      )}
      <div className="flex flex-col gap-3">
        <h2 className="section-title">Movimientos</h2>
        {data.history.length === 0 ? (
          <p className="text-base leading-6 text-muted">Todavía no hay transferencias.</p>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {data.history.map((row) => (
              <li key={row.id} className="py-4">
                <p className="text-base text-ink">{row.title}</p>
                <p className="text-sm text-muted">{row.detail}</p>
                <p className="amount-secondary mt-2">{row.amountLabel}</p>
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
