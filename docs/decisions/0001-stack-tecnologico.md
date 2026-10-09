# ADR 0001: Stack tecnológico

- **Estado:** Aceptada
- **Fecha:** 2026-10-09
- **Artículo constitucional:** §2.6

## Contexto

Praxis necesita una aplicación web tipada, instalable en el teléfono, con un ciclo de desarrollo rápido para trabajo guiado por agentes.

## Decisión

- **Next.js** (App Router) como marco web y capa de API.
- **TypeScript** estricto como único lenguaje de aplicación.
- **Bun** como runtime de scripts, instalador y entorno local (`bun dev`, `bun test`).
- **Tailwind CSS** para UI y **lucide-react** para iconos.
- **Zod** para validar fronteras (formulario, agente, API).

La base de datos queda definida en [ADR 0004](./0004-mongodb-y-autenticacion.md). La instalación como PWA, en [ADR 0006](./0006-pwa-mobile-first.md).

## Consecuencias

- No se añade npm, yarn ni pnpm como gestor canónico.
- No se introduce otro framework UI sin un ADR que sustituya a este.
- El dinero no se modela con librerías de punto flotante. Ver [ADR 0005](./0005-dinero-y-confirmacion.md).
