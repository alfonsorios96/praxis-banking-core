# Praxis

Harness de agentes para un **core bancario** (usuarios, cuentas, tarjetas, transferencias y pagos). La interfaz es web, mobile-first, e instalable como PWA.

Esta versión autentica y navega. No mueve dinero. Cada capacidad de negocio entra con una spec.

Stack: **Next.js** (App Router), **Bun**, **TypeScript**, **MongoDB Atlas**. Sesión JWT. Un rol `user`.

## Constitución y SDD

La norma del proyecto está en [`docs/constitution.md`](./docs/constitution.md). Esquema Atlas: [`docs/domain/mongo.md`](./docs/domain/mongo.md).

| Carpeta | Rol |
| --- | --- |
| [`current/`](./current/README.md) | Trabajo parcial de una tarea guiada por IA (no se versiona). |
| [`docs/`](./docs/constitution.md) | Decisiones y procesos; forman parte de la constitución. |

Nueva tarea:

```bash
bun run sdd:new -- --id nombre-de-la-tarea
```

## Desarrollo

Copia `.env.example` a `.env.local` y rellena Atlas, `SESSION_SECRET` (mínimo 32 caracteres) y el usuario semilla:

```bash
cp .env.example .env.local
openssl rand -base64 32
```

Si `users` está vacía, se crea el usuario `AUTH_SEED_USERNAME` / `AUTH_SEED_PASSWORD`.

```bash
bun install
bun dev
```

- App (protegida): [http://localhost:3000](http://localhost:3000)
- Login: [http://localhost:3000/login](http://localhost:3000/login)
- Health (público): [http://localhost:3000/api/health](http://localhost:3000/api/health)

El service worker se genera al final de `bun run build` (`next build` y luego `serwist build`) y se registra con `bun start`. En `bun dev` queda desactivado. La instalación como PWA pide HTTPS o localhost con el worker activo.

```bash
bun run lint
bun run test
bun run build
```

## Estructura

```
src/app          rutas Next.js (`login` pública, `(app)` autenticada)
src/auth         sesión JWT y login
src/db           Mongoose, modelo users, seed
src/proxy.ts     redirección si no hay sesión
src/agents       orquestador y misiones de sub-agentes
src/domain       esquemas Zod y balance de asientos
src/sw.ts        service worker (Serwist)
```
