import type { Metadata } from "next";
import { requireModule } from "@/auth/guard";
import { PendingSpec } from "@/ui/pending-spec";

export const metadata: Metadata = { title: "Pagos" };

export default async function PagosPage() {
  await requireModule("payments");
  return (
    <PendingSpec
      title="Pagos"
      body="Aquí se propondrá un pago a un comercio o servicio. El cargo no se registra hasta que el titular confirme y el ledger escriba el asiento."
    />
  );
}
