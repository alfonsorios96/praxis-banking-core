# `current/` — trabajo parcial guiado por IA

Esta carpeta es el **harness operativo** de Spec-Driven Development. Aquí viven solo los archivos de una tarea **en curso**. No forma parte de la constitución.

## Reglas

1. Una carpeta por tarea: `current/<id-kebab>/`.
2. Crear con `bun run sdd:new -- --id <id-kebab>` o copiar `_template/`.
3. No importar nada de `current/` desde `src/`.
4. Al cerrar: promover decisiones a `docs/decisions/`, código a `src/`, y borrar o dejar de versionar el resto.
5. Git ignora todo excepto `_template/`, este README y `.gitignore`.

## Contenido mínimo de una tarea

| Archivo | Uso |
| --- | --- |
| `spec.md` | Qué y por qué; fuera de alcance; aceptación |
| `plan.md` | Cómo; ADRs; riesgos |
| `tasks.md` | Lista ordenada de implementación |
| `notes.md` | Borradores, dudas, dumps de agente |
| `acceptance.md` | Evidencia de que se cumplió la spec |

Constitución: [`docs/constitution.md`](../docs/constitution.md).  
Proceso: [`docs/processes/spec-driven-development.md`](../docs/processes/spec-driven-development.md).
