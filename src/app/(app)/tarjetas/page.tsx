import type { Metadata } from "next";
import { requireModule } from "@/auth/guard";
import { listOwnedCards, type OwnedCard } from "@/cards/queries";
import { CardCarousel } from "@/ui/card-carousel";

export const metadata: Metadata = { title: "Tarjetas" };

export default async function TarjetasPage() {
  const session = await requireModule("cards");
  const cards = await loadCards(session.userId);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="screen-title">Tarjetas</h1>
        <p className="text-base leading-6 text-muted">
          Tarjetas de débito de prueba. No hacen cargos.
        </p>
      </div>
      {cards ? (
        <CardCarousel cards={cards} />
      ) : (
        <p className="text-base leading-6 text-muted">
          No se pudieron cargar las tarjetas. Revisa la conexión a MongoDB.
        </p>
      )}
    </section>
  );
}

async function loadCards(userId: string): Promise<OwnedCard[] | null> {
  try {
    return await listOwnedCards(userId);
  } catch (error) {
    console.error("[praxis] tarjetas", error instanceof Error ? error.message : "error");
    return null;
  }
}
