"use server";

import { revalidatePath } from "next/cache";
import { ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { verifySession } from "@/auth/dal";
import { moduleEnabled } from "@/auth/guard";
import { issueDigitalCard } from "@/cards/digital";
import { connectDb } from "@/db/connect";
import { CardModel } from "@/db/models/card";
import { isObjectId } from "@/db/object-id";

export type CardFreezeState = {
  message?: string;
  error?: string;
};

export async function setCardFrozen(
  _state: CardFreezeState | undefined,
  formData: FormData,
): Promise<CardFreezeState> {
  const session = await verifySession();
  if (!session || session.role !== ROLE_CUENTAHABIENTE) {
    return { error: "Solo el titular puede congelar su tarjeta." };
  }
  if (!(await moduleEnabled(session.userId, "cards"))) {
    return { error: "Tarjetas no está activo para ti." };
  }

  const cardId = formData.get("cardId");
  if (typeof cardId !== "string" || !isObjectId(cardId)) {
    return { error: "Elige una tarjeta." };
  }
  const intent = formData.get("intent");
  if (intent !== "freeze" && intent !== "unfreeze") {
    return { error: "Elige congelar o descongelar." };
  }
  const frozen = intent === "freeze";

  try {
    await connectDb();
    const updated = await CardModel.findOneAndUpdate(
      { _id: cardId, ownerId: session.userId, status: { $in: ["active", "frozen"] } },
      { $set: { status: frozen ? "frozen" : "active" } },
      { returnDocument: "after" },
    )
      .select("last4")
      .lean();
    if (!updated) {
      return { error: "No encontramos esa tarjeta." };
    }
    revalidatePath("/tarjetas");
    return {
      message: frozen
        ? `Tarjeta •••• ${updated.last4} congelada.`
        : `Tarjeta •••• ${updated.last4} activa de nuevo.`,
    };
  } catch (error) {
    console.error("[praxis] tarjetas", error instanceof Error ? error.message : "error");
    return { error: "No se pudo guardar. Revisa la conexión a MongoDB." };
  }
}

export type DigitalCardState = {
  message?: string;
  error?: string;
  unavailable?: boolean;
  issuedAt?: number;
};

export async function createDigitalCard(): Promise<DigitalCardState> {
  const session = await verifySession();
  if (!session || session.role !== ROLE_CUENTAHABIENTE) {
    return { error: "Solo el titular puede crear una tarjeta digital." };
  }
  if (!(await moduleEnabled(session.userId, "cards"))) {
    return { error: "Tarjetas no está activo para ti." };
  }

  try {
    const result = await issueDigitalCard(session.userId);
    if (result.outcome === "unavailable") {
      return { unavailable: true };
    }
    if (result.outcome === "no-account") {
      return { error: "Necesitas una cuenta corriente abierta para crear una tarjeta digital." };
    }
    revalidatePath("/tarjetas");
    return { message: `Tarjeta digital •••• ${result.last4} creada.`, issuedAt: Date.now() };
  } catch (error) {
    console.error("[praxis] tarjeta digital", error instanceof Error ? error.message : "error");
    return { error: "No se pudo crear la tarjeta. Revisa la conexión a MongoDB." };
  }
}
