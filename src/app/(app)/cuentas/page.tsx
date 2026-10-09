import type { Metadata } from "next";
import { ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { requireRole } from "@/auth/guard";
import { PendingSpec } from "@/ui/pending-spec";

export const metadata: Metadata = { title: "Cuentas" };

export default async function CuentasPage() {
  await requireRole(ROLE_CUENTAHABIENTE);
  return (
    <PendingSpec
      title="Cuentas"
      body="Aquí vivirán las cuentas del titular y su estado. El saldo no se edita en la cuenta: lo derivará el ledger cuando exista esa spec."
    />
  );
}
