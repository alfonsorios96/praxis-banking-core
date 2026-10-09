# Praxis

Harness de agentes para un **core bancario** (usuarios, cuentas, tarjetas, transferencias y pagos). La interfaz es web, mobile-first, e instalable como PWA.

Esta versión autentica, navega y mueve dinero solo en traspasos internos confirmados. Tarjetas y pagos siguen en espera.

Stack: **Next.js** (App Router), **Bun**, **TypeScript**, **MongoDB Atlas**. Sesión JWT. Roles `administrador` y `cuentahabiente`.

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

Al conectar, `AUTH_SEED_USERNAME` (por defecto `praxis`) queda como administrador. Si faltan, se crean los cuentahabientes `sofia`, `diego` y `valeria` con `AUTH_SEED_PASSWORD`. Si `praxis` ya existía, conserva su contraseña. Una sesión antigua con rol `user` deja de valer.

| Usuario | Rol | Ve |
| --- | --- | --- |
| `praxis` | administrador | Inicio (paneles) y Configuración |
| `sofia`, `diego`, `valeria` | cuentahabiente | Inicio, Cuentas, Tarjetas, Transferencias y Pagos |

Cada cuentahabiente nace con Ahorro (5.000,00 €) y Corriente (10.000,00 €). Cada cuenta tiene un IBAN español. El saldo sale del ledger. Puede transferir a la corriente de otro cuentahabiente: elige su IBAN de origen, el importe y confirma. El administrador no tiene cuentas.

Cada build es una release. En Configuración el administrador fija el porcentaje, escalones por fecha y cuentahabientes concretos. Quien es candidato puede cargar esa versión al momento o en el siguiente refresh.

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
src/db           Mongoose, usuarios, cuentas, transferencias, asientos
src/ledger       única escritura de asientos
src/accounts     alta de Ahorro, Corriente e IBAN
src/transfers    traspaso interno confirmado
src/proxy.ts     redirección si no hay sesión
src/agents       orquestador y misiones de sub-agentes
src/domain       esquemas Zod, céntimos, IBAN y balance de asientos
src/sw.ts        service worker (Serwist)
```
