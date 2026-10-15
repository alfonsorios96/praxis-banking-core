import type { Metadata } from "next";
import { requireModule } from "@/auth/guard";
import { PendingSpec } from "@/ui/pending-spec";

export const metadata: Metadata = { title: "Tarjetas" };

export default async function TarjetasPage() {
  await requireModule("cards");
  return (
    <PendingSpec
      title="Tarjetas"
      body="Todavía no puedes ver ni usar tarjetas."
    />
  );
}
