import type { Metadata } from "next";
import { ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { requireRole } from "@/auth/guard";
import { PendingSpec } from "@/ui/pending-spec";

export const metadata: Metadata = { title: "Pagos" };

export default async function PagosPage() {
  await requireRole(ROLE_CUENTAHABIENTE);
  return (
    <PendingSpec
      title="Pagos"
      body="Aquí se propondrá un pago a un comercio o servicio. El cargo no se registra hasta que el titular confirme y el ledger escriba el asiento."
    />
  );
}
