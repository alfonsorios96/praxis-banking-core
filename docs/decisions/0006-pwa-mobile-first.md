# ADR 0006: PWA mobile-first

- **Estado:** Aceptada
- **Fecha:** 2026-10-09
- **Artículo constitucional:** §2.8

## Contexto

La aplicación es web, y el uso principal es el teléfono. Debe poder instalarse en la pantalla de inicio y sentirse como una app, también cuando se abre en el escritorio.

## Decisión

- Interfaz en una columna de teléfono (`max-w-md`). En pantallas mayores, esa columna se centra sobre un fondo distinto.
- Navegación inferior con cinco destinos: Inicio, Cuentas, Tarjetas, Transferencias y Pagos. La barra respeta `safe-area-inset-bottom`. La cabecera respeta `safe-area-inset-top`.
- Objetivos táctiles de al menos 44px. `viewport-fit=cover`.
- Manifest (`src/app/manifest.ts`), iconos en `public/icons/` e `src/app/icon.png`.
- Service worker con **Serwist** en modo configurador (`serwist.config.js`, `src/sw.ts` → `public/sw.js`), compatible con el build Turbopack de Next.js 16. `bun run build` ejecuta `next build` y después `serwist build`, que precachea el shell. En `next dev` el provider no registra el worker. En `next start` sí.
- `display: standalone`. Tema `#1f4f46`.

## Consecuencias

- No se diseña primero un layout de escritorio con navegación lateral.
- El worker generado no se versiona. El empaquetado usa el modo configurador de Serwist, no el plugin de webpack, porque Next.js 16 compila con Turbopack.
- Sin HTTPS (o localhost) el navegador no ofrece instalación. El modo desarrollo no registra el worker.
