import type { Metadata } from "next";
import { ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { requireRole } from "@/auth/guard";
import { PendingSpec } from "@/ui/pending-spec";

export const metadata: Metadata = { title: "Transferencias" };

export default async function TransferenciasPage() {
  await requireRole(ROLE_CUENTAHABIENTE);
  return (
    <PendingSpec
      title="Transferencias"
      body="Aquí se propondrá un traspaso entre cuentas. Confirmarlo y escribir el asiento queda para la spec de ledger."
    />
  );
}
