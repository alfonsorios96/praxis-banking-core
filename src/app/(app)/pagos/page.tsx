import type { Metadata } from "next";
import { PendingSpec } from "@/ui/pending-spec";

export const metadata: Metadata = { title: "Pagos" };

export default function PagosPage() {
  return (
    <PendingSpec
      title="Pagos"
      body="Aquí se propondrá un pago a un comercio o servicio. El cargo no se registra hasta que el titular confirme y el ledger escriba el asiento."
    />
  );
}
