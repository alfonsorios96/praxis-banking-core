"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { ROLE_ADMINISTRADOR, ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { verifySession } from "@/auth/dal";
import { connectDb } from "@/db/connect";
import { listPeople } from "@/db/directory";
import { Release } from "@/db/models/release";
import { RELEASE_COOKIE } from "@/releases/constants";
import { candidateFor, ensureCurrentRelease, readCurrentRelease } from "@/releases/store";

const percentSchema = z.coerce.number().int().min(0).max(100);

const stepsSchema = z
  .array(
    z.object({
      at: z.string().min(1),
      percent: z.number().int().min(0).max(100),
    }),
  )
  .max(24);

export type ReleaseFormState = {
  message?: string;
  error?: string;
};

export async function updateRelease(
  _state: ReleaseFormState | undefined,
  formData: FormData,
): Promise<ReleaseFormState> {
  const session = await verifySession();
  if (!session || session.role !== ROLE_ADMINISTRADOR) {
    return { error: "Solo un administrador puede abrir una release." };
  }

  const percent = percentSchema.safeParse(formData.get("percent"));
  if (!percent.success) {
    return { error: "El porcentaje tiene que ser un entero de 0 a 100." };
  }

  let parsedSteps: z.infer<typeof stepsSchema>;
  try {
    const raw = formData.get("steps");
    const json = typeof raw === "string" && raw.trim() ? JSON.parse(raw) : [];
    const steps = stepsSchema.safeParse(json);
    if (!steps.success) {
      return { error: "Revisa los escalones." };
    }
    parsedSteps = steps.data;
  } catch {
    return { error: "Revisa los escalones." };
  }

  const stepsByTime = new Map<number, number>();
  for (const step of parsedSteps) {
    const at = new Date(step.at);
    if (Number.isNaN(at.getTime())) {
      return { error: "Revisa la fecha de un escalón." };
    }
    const time = at.getTime();
    stepsByTime.set(time, Math.max(stepsByTime.get(time) ?? 0, step.percent));
  }
  const steps = [...stepsByTime.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([time, stepPercent]) => ({ at: new Date(time), percent: stepPercent }));

  try {
    await connectDb();
    const buildId = await ensureCurrentRelease();
    const people = await listPeople();
    const holderIds = new Set(
      people.filter((person) => person.role === ROLE_CUENTAHABIENTE).map((person) => person.id),
    );
    const allowUserIds = [
      ...new Set(
        formData
          .getAll("allowUserIds")
          .filter((value): value is string => typeof value === "string" && holderIds.has(value)),
      ),
    ];

    await Release.updateOne(
      { buildId },
      { $set: { percent: percent.data, allowUserIds, steps } },
    );
  } catch (error) {
    console.error(error);
    return { error: "No se pudo guardar la release. Revisa la conexión a MongoDB." };
  }

  revalidatePath("/", "layout");
  return { message: "Release actualizada." };
}

export async function acceptRelease(buildId: string): Promise<{ ok: boolean }> {
  const session = await verifySession();
  if (!session || typeof buildId !== "string" || !buildId) {
    return { ok: false };
  }

  try {
    await connectDb();
    const release = await readCurrentRelease();
    if (!release || release.buildId !== buildId) {
      return { ok: false };
    }
    const candidate = candidateFor(release, {
      role: session.role,
      userId: session.userId,
      now: new Date(),
    });
    if (!candidate) {
      return { ok: false };
    }
    const cookieStore = await cookies();
    cookieStore.set(RELEASE_COOKIE, buildId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } catch (error) {
    console.error(error);
    return { ok: false };
  }

  return { ok: true };
}
