import { describe, expect, test } from "bun:test";
import { SEED_ACCOUNT_HOLDERS, SEED_ADMIN_USERNAME } from "./seed-roster";

describe("semilla de acceso", () => {
  test("hay tres cuentahabientes distintos del administrador", () => {
    const usernames = SEED_ACCOUNT_HOLDERS.map((holder) => holder.username);
    expect(usernames).toHaveLength(3);
    expect(new Set(usernames).size).toBe(3);
    expect(usernames).not.toContain(SEED_ADMIN_USERNAME);
    for (const holder of SEED_ACCOUNT_HOLDERS) {
      expect(holder.username).toMatch(/^[a-z]{2,64}$/);
      expect(holder.fullName.trim().length).toBeGreaterThan(0);
    }
  });
});
