# ADR 0014: Canary release con los módulos

- **Estado:** Aceptada
- **Fecha:** 2026-10-15
- **Artículo constitucional:** §2.8

## Contexto

El [ADR 0008](./0008-liberacion-gradual.md) abría cada build por porcentaje, por fecha o por persona, con un aviso de versión nueva y un service worker en espera. Cuesta verlo y explicarlo: el build es invisible para quien lo recibe. Los módulos por persona del [ADR 0012](./0012-modulos-por-persona.md) ya muestran la misma idea con algo que se ve: abrir una función a pocas personas antes que a todas.

## Decisión

- Se retira la liberación por build. No hay sección Versión, aviso de versión nueva, cookie `praxis_release`, etiqueta de versión en la cabecera ni colección `releases` en el código.
- El service worker se activa en cuanto se instala. Un build nuevo llega a todos al recargar.
- El canary se explica en Configuración, sobre los módulos. Cada módulo muestra cuántos cuentahabientes lo tienen, en una barra con un segmento por persona, y su etapa:
  - **Apagado:** nadie lo tiene.
  - **Canario:** una sola persona lo tiene, y no es la única que hay.
  - **Parcial:** varias lo tienen, pero no todas.
  - **Todos:** todas lo tienen.
- Ampliar es activar a más personas. Revertir es desactivar. Activar y Desactivar siguen como en el ADR 0012.

## Consecuencias

- Sustituye al ADR 0008. La constitución pasa a 3.0.0: el §2.8 deja de describir releases.
- Un cliente que ya tenía el worker anterior en espera lo activa al cerrar sus pestañas.
- La colección `releases` en Atlas queda sin uso. Se puede borrar a mano.
- No hay porcentajes ni fechas por módulo. La etapa se calcula del recuento.
