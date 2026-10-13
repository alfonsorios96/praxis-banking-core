import { describe, expect, test } from "bun:test";
import { readFirebaseAdminCredentials, readFirebasePublicConfig } from "./credentials";
import { deliverTransferPush } from "./deliver";
import { shouldNotifyRecipient, transferPushData } from "./message";
import { deviceTokenSchema } from "./token";

const pushData = {
  title: "Transferencia recibida",
  body: "1,00 € de Sofía",
  url: "/transferencias",
};

const credentials = {
  projectId: "praxis",
  clientEmail: "push@praxis.test",
  privateKey: "key",
};

describe("aviso de transferencia", () => {
  test("el texto lleva el importe y el nombre, sin IBAN", () => {
    expect(transferPushData({ amountMinor: 2500, senderLabel: "Sofía Herrera" })).toEqual({
      title: "Transferencia recibida",
      body: "25,00 € de Sofía Herrera",
      url: "/transferencias",
    });
    expect(transferPushData({ amountMinor: 100_000, senderLabel: "Diego Navarro" }).body).toBe(
      "1.000,00 € de Diego Navarro",
    );
    expect(Object.keys(transferPushData({ amountMinor: 1, senderLabel: "Ana" }))).toEqual([
      "title",
      "body",
      "url",
    ]);
  });

  test("un duplicado no avisa y un rechazo tampoco", () => {
    expect(shouldNotifyRecipient({ ok: true, duplicate: false })).toBe(true);
    expect(shouldNotifyRecipient({ ok: true, duplicate: true })).toBe(false);
    expect(shouldNotifyRecipient({ ok: false })).toBe(false);
  });

  test("sin credenciales no envía", async () => {
    let sent = 0;
    const result = await deliverTransferPush({
      credentials: null,
      tokens: ["token-de-prueba-1234567890"],
      data: pushData,
      send: async () => {
        sent += 1;
      },
      forget: async () => {},
    });
    expect(sent).toBe(0);
    expect(result).toEqual({ sent: 0, forgotten: [] });
    expect(readFirebaseAdminCredentials({})).toBeNull();
    expect(readFirebasePublicConfig({})).toBeNull();
  });

  test("la cuenta de servicio recupera el salto de línea de la clave", () => {
    expect(
      readFirebaseAdminCredentials({
        FIREBASE_PROJECT_ID: " praxis ",
        FIREBASE_CLIENT_EMAIL: "a@b.c",
        FIREBASE_PRIVATE_KEY: "line\\nline",
      }),
    ).toEqual({
      projectId: "praxis",
      clientEmail: "a@b.c",
      privateKey: "line\nline",
    });
  });

  test("borra el token que FCM rechaza y sigue con el resto", async () => {
    const forgotten: string[] = [];
    const sent: string[] = [];
    const result = await deliverTransferPush({
      credentials,
      tokens: [
        "token-no-registrado-000001",
        "token-valido-000000000002",
        "token-invalido-0000000003",
      ],
      data: pushData,
      send: async (token) => {
        if (token.includes("no-registrado")) {
          throw Object.assign(new Error("stale"), {
            code: "messaging/registration-token-not-registered",
          });
        }
        if (token.includes("invalido")) {
          throw Object.assign(new Error("invalid"), {
            code: "messaging/invalid-registration-token",
          });
        }
        sent.push(token);
      },
      forget: async (token) => {
        forgotten.push(token);
      },
    });
    expect(sent).toEqual(["token-valido-000000000002"]);
    expect(forgotten).toEqual(["token-no-registrado-000001", "token-invalido-0000000003"]);
    expect(result.sent).toBe(1);
  });

  test("un fallo distinto no borra el token", async () => {
    const forgotten: string[] = [];
    const sent: string[] = [];
    const result = await deliverTransferPush({
      credentials,
      tokens: ["token-caido-000000000001", "token-sano-0000000000002"],
      data: pushData,
      send: async (token) => {
        if (token.includes("caido")) {
          throw Object.assign(new Error("down"), { code: "messaging/server-unavailable" });
        }
        sent.push(token);
      },
      forget: async (token) => {
        forgotten.push(token);
      },
    });
    expect(sent).toEqual(["token-sano-0000000000002"]);
    expect(forgotten).toEqual([]);
    expect(result.forgotten).toEqual([]);
  });

  test("acepta un token de registro y rechaza uno corto", () => {
    expect(deviceTokenSchema.safeParse("a".repeat(20)).success).toBe(true);
    expect(deviceTokenSchema.safeParse("corto").success).toBe(false);
    expect(deviceTokenSchema.safeParse("con espacio 123456789012345").success).toBe(false);
  });
});
