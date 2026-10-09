# ADR 0002: Spec-Driven Development

- **Estado:** Aceptada
- **Fecha:** 2026-10-09
- **Artículo constitucional:** §2.1, §2.5, §4

## Contexto

El trabajo lo harán humanos y agentes. Sin un harness, las IA generan código huérfano, mezclan decisiones con borradores y contaminan `src/` con experimentos.

## Decisión

Dos carpetas de gobierno:

| Carpeta | Rol |
| --- | --- |
| `current/` | Trabajo **parcial** de una tarea guiada por IA. No es constitución ni producto. |
| `docs/` | Decisiones y procesos **permanentes**. Forman parte de la constitución. |

El flujo Specify → Plan → Tasks → Build → Decide → Promote está definido en `docs/processes/spec-driven-development.md` y en `current/_template/`.

Los contenidos de trabajo bajo `current/` (salvo `_template/` y el README) **no se versionan** en git.

Una tarea nueva se abre con:

```bash
bun run sdd:new -- --id nombre-de-la-tarea
```

## Consecuencias

- Un agente que vaya a implementar debe crear o actualizar `current/<id>/spec.md` antes de tocar `src/` de forma sustancial.
- Al cerrar la tarea, lo que deba sobrevivir se mueve a `src/` o a `docs/decisions/`.
- `current/` no se usa como documentación de producto ni como historial de arquitectura.
- `src/` no importa archivos de `current/`.
