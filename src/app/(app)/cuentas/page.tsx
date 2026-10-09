import type { Metadata } from "next";
import { PendingSpec } from "@/ui/pending-spec";

export const metadata: Metadata = { title: "Cuentas" };

export default function CuentasPage() {
  return (
    <PendingSpec
      title="Cuentas"
      body="Aquí vivirán las cuentas del titular y su estado. El saldo no se edita en la cuenta: lo derivará el ledger cuando exista esa spec."
    />
  );
}
