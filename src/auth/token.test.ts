import { describe, expect, test } from "bun:test";
import type { UserRole } from "@/domain/schemas";
import { decryptSession, encryptSession } from "./token";

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  process.env.SESSION_SECRET = "x".repeat(32);
}

describe("sesión", () => {
  test("acepta administrador y cuentahabiente", async () => {
    for (const role of ["administrador", "cuentahabiente"] as const) {
      const token = await encryptSession({
        userId: "1",
        username: "praxis",
        role,
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      });
      const payload = await decryptSession(token);
      expect(payload?.role).toBe(role);
    }
  });

  test("rechaza el rol user", async () => {
    const token = await encryptSession({
      userId: "1",
      username: "praxis",
      role: "user" as UserRole,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });
    expect(await decryptSession(token)).toBeNull();
  });
});
