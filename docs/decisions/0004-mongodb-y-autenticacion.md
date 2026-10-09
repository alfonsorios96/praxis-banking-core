# ADR 0004: MongoDB Atlas y autenticación

- **Estado:** Aceptada
- **Fecha:** 2026-10-09
- **Artículo constitucional:** §2.6, §2.7

## Contexto

El shell necesita identidad antes de que existan cuentas o movimientos. La persistencia elegida para el proyecto es MongoDB Atlas, alineada con el harness de referencia.

## Decisión

- **MongoDB Atlas** vía Mongoose. Nombre de base por defecto: `praxis` (`MONGODB_DB`).
- La única colección de esta versión es `users`.
- Un rol: `user`. Contraseña con **bcryptjs**. Sesión **JWT HS256** (`jose`) en cookie HttpOnly `praxis_session`, 7 días, `SameSite=Lax`, `Secure` en producción.
- `SESSION_SECRET` tiene al menos 32 caracteres.
- No hay registro público. Si `users` está vacía y existen `AUTH_SEED_USERNAME` y `AUTH_SEED_PASSWORD`, se crea ese usuario al conectar.
- Rutas públicas: `/login`, `/api/health`, `/manifest.webmanifest` y `/sw.js`. El resto redirige a `/login` si no hay sesión. Un usuario ya autenticado que visita `/login` vuelve a `/`.

## Consecuencias

- Sin `MONGODB_URI` el login no puede completar. El health check no depende de la base.
- Cuentas, tarjetas, transferencias, pagos y asientos no tienen colección hasta su spec.
- No se añade otro proveedor de identidad sin ADR.
