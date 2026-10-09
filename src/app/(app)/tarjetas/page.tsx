import type { Metadata } from "next";
import { PendingSpec } from "@/ui/pending-spec";

export const metadata: Metadata = { title: "Tarjetas" };

export default function TarjetasPage() {
  return (
    <PendingSpec
      title="Tarjetas"
      body="Aquí vivirán el plástico, su estado y sus límites. Una tarjeta no autoriza cargos por sí sola."
    />
  );
}
