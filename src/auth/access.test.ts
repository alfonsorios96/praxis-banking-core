import { describe, expect, test } from "bun:test";
import { userRoleSchema } from "@/domain/schemas";
import {
  ADMIN_PATHS,
  HOLDER_PATHS,
  canAccessPath,
  landingPath,
  pathsForRole,
  visiblePaths,
} from "./access";

describe("userRoleSchema", () => {
  test("admite administrador y cuentahabiente", () => {
    expect(userRoleSchema.safeParse("administrador").success).toBe(true);
    expect(userRoleSchema.safeParse("cuentahabiente").success).toBe(true);
  });

  test("rechaza el rol user", () => {
    expect(userRoleSchema.safeParse("user").success).toBe(false);
  });
});

describe("acceso por rol", () => {
  test("el administrador solo tiene inicio, monitoring y configuración", () => {
    expect(pathsForRole("administrador")).toEqual(ADMIN_PATHS);
    expect(canAccessPath("administrador", "/")).toBe(true);
    expect(canAccessPath("administrador", "/monitoreo")).toBe(true);
    expect(canAccessPath("administrador", "/configuracion")).toBe(true);
    expect(canAccessPath("administrador", "/cuentas")).toBe(false);
    expect(canAccessPath("administrador", "/tarjetas")).toBe(false);
    expect(canAccessPath("administrador", "/transferencias")).toBe(false);
    expect(canAccessPath("administrador", "/pagos")).toBe(false);
  });

  test("el cuentahabiente conserva el shell y no entra a configuración", () => {
    expect(pathsForRole("cuentahabiente")).toEqual(HOLDER_PATHS);
    expect(canAccessPath("cuentahabiente", "/cuentas")).toBe(true);
    expect(canAccessPath("cuentahabiente", "/tarjetas")).toBe(true);
    expect(canAccessPath("cuentahabiente", "/transferencias")).toBe(true);
    expect(canAccessPath("cuentahabiente", "/pagos")).toBe(true);
    expect(canAccessPath("cuentahabiente", "/configuracion")).toBe(false);
    expect(canAccessPath("cuentahabiente", "/monitoreo")).toBe(false);
  });

  test("la barra omite los módulos apagados", () => {
    expect(visiblePaths("cuentahabiente", ["/pagos"])).toEqual([
      "/",
      "/cuentas",
      "/tarjetas",
      "/transferencias",
    ]);
    expect(visiblePaths("cuentahabiente", [])).toEqual(HOLDER_PATHS);
  });

  test("una ruta pedida al rol equivocado cae en inicio", () => {
    expect(landingPath("administrador", "/cuentas")).toBe("/");
    expect(landingPath("cuentahabiente", "/configuracion")).toBe("/");
    expect(landingPath("cuentahabiente", "/monitoreo")).toBe("/");
    expect(landingPath("administrador", "/monitoreo")).toBe("/monitoreo");
    expect(landingPath("cuentahabiente", "/tarjetas")).toBe("/tarjetas");
    expect(landingPath("administrador", "//evil.example")).toBe("/");
  });
});
