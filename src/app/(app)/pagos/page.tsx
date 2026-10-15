import type { Metadata } from "next";
import { requireModule } from "@/auth/guard";
import { PendingSpec } from "@/ui/pending-spec";

export const metadata: Metadata = { title: "Pagos" };

export default async function PagosPage() {
  await requireModule("payments");
  return (
    <PendingSpec
      title="Pagos"
      body="Todavía no puedes pagar desde aquí."
    />
  );
}
