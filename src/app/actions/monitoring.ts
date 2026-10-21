"use server";

import { revalidatePath } from "next/cache";
import { ROLE_ADMINISTRADOR } from "@/auth/constants";
import { verifySession } from "@/auth/dal";
import { connectDb } from "@/db/connect";
import { setFaultSimulation } from "@/db/models/platform-settings";

export type FaultSimulationState = {
  message?: string;
  error?: string;
};

export async function updateFaultSimulation(
  _state: FaultSimulationState | undefined,
  formData: FormData,
): Promise<FaultSimulationState> {
  const session = await verifySession();
  if (!session || session.role !== ROLE_ADMINISTRADOR) {
    return { error: "Solo un administrador puede cambiar la simulación." };
  }

  const intent = formData.get("intent");
  if (intent !== "on" && intent !== "off") {
    return { error: "Elige encender o apagar la simulación." };
  }

  try {
    await connectDb();
    await setFaultSimulation(intent === "on");
  } catch (error) {
    console.error(error);
    return { error: "No se pudo guardar. Revisa la conexión a MongoDB." };
  }

  revalidatePath("/monitoreo");
  return {
    message:
      intent === "on"
        ? "Simulación encendida. 2 de cada 5 emisiones fallarán."
        : "Simulación apagada. Las emisiones se completan.",
  };
}
