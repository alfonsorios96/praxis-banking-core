"use server";

import { revalidatePath } from "next/cache";
import { ROLE_ADMINISTRADOR, ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { verifySession } from "@/auth/dal";
import { listPeople } from "@/db/directory";
import { isModuleKey, MODULE_LABEL } from "@/modules/keys";
import { setModuleFor } from "@/modules/store";
import { notifyModuleChanged } from "@/notifications/send";

export type ModulesFormState = {
  message?: string;
  error?: string;
};

export async function updateModuleAccess(
  _state: ModulesFormState | undefined,
  formData: FormData,
): Promise<ModulesFormState> {
  const session = await verifySession();
  if (!session || session.role !== ROLE_ADMINISTRADOR) {
    return { error: "Solo un administrador puede cambiar los módulos." };
  }

  const key = formData.get("module");
  if (!isModuleKey(key)) {
    return { error: "Elige un módulo." };
  }
  const intent = formData.get("intent");
  if (intent !== "enable" && intent !== "disable") {
    return { error: "Elige activar o desactivar." };
  }
  const enabled = intent === "enable";

  let changed: string[];
  try {
    const people = await listPeople();
    const holderIds = new Set(
      people.filter((person) => person.role === ROLE_CUENTAHABIENTE).map((person) => person.id),
    );
    const userIds = formData
      .getAll("userIds")
      .filter((value): value is string => typeof value === "string" && holderIds.has(value));
    if (userIds.length === 0) {
      return { error: "Marca al menos un cuentahabiente." };
    }
    changed = await setModuleFor(userIds, key, enabled);
  } catch (error) {
    console.error(error);
    return { error: "No se pudo guardar. Revisa la conexión a MongoDB." };
  }

  await notifyModuleChanged({ userIds: changed, key, enabled });

  revalidatePath("/", "layout");
  const label = MODULE_LABEL[key];
  if (changed.length === 0) {
    return { message: `${label}: nadie cambió.` };
  }
  const verb = enabled ? "activado" : "desactivado";
  const people = changed.length === 1 ? "1 cuentahabiente" : `${changed.length} cuentahabientes`;
  return { message: `${label} ${verb} para ${people}.` };
}
