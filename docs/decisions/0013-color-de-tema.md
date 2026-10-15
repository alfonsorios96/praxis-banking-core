# ADR 0013: Color de tema

- **Estado:** Aceptada
- **Fecha:** 2026-10-14
- **Artículo constitucional:** §2.8

## Contexto

El [ADR 0006](./0006-pwa-mobile-first.md) fijó el tema de la PWA en `#1f4f46`. La interfaz pasa a una banca de uso diario, con fondo claro y un acento azul. Ese verde ya no es el color de la barra del sistema ni del manifest.

## Decisión

El color de tema y el `theme_color` del manifest son `#1D4E89`. El fondo de la PWA es `#F4F7FB`, el de la columna. Los iconos instalados no cambian.

## Consecuencias

- El verde `#1f4f46` deja de ser el tema. El acento de la interfaz y el tema de la PWA son el mismo azul.
- No se regeneran los iconos de `public/icons/` ni `src/app/icon.png` por este cambio.
- La columna de teléfono, la navegación inferior y las áreas seguras del ADR 0006 siguen igual.
