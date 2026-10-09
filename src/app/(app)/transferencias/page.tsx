import type { Metadata } from "next";
import { PendingSpec } from "@/ui/pending-spec";

export const metadata: Metadata = { title: "Transferencias" };

export default function TransferenciasPage() {
  return (
    <PendingSpec
      title="Transferencias"
      body="Aquí se propondrá un traspaso entre cuentas. Confirmarlo y escribir el asiento queda para la spec de ledger."
    />
  );
}
