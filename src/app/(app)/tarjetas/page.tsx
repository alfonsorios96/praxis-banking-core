import type { Metadata } from "next";
import { ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { requireRole } from "@/auth/guard";
import { PendingSpec } from "@/ui/pending-spec";

export const metadata: Metadata = { title: "Tarjetas" };

export default async function TarjetasPage() {
  await requireRole(ROLE_CUENTAHABIENTE);
  return (
    <PendingSpec
      title="Tarjetas"
      body="Aquí vivirán el plástico, su estado y sus límites. Una tarjeta no autoriza cargos por sí sola."
    />
  );
}
