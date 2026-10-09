# Proceso: Spec-Driven Development

## Carpetas

```
current/                 # efímero — tarea en curso
  _template/             # copiar, no editar in-place
  <id-kebab>/            # spec, plan, tasks, notes, acceptance
docs/                    # permanente — constitución
  constitution.md
  decisions/             # ADRs ratificados
  processes/
  domain/
```

## Crear una tarea

```bash
bun run sdd:new -- --id apertura-de-cuenta
```

Esto copia `current/_template/` a `current/apertura-de-cuenta/`.

## DoD (Definition of Done) de una spec

- [ ] `spec.md` describe problema, actores, fuera de alcance y criterios de aceptación.
- [ ] `plan.md` cita constitución y ADRs afectados y no introduce stack nuevo sin ADR.
- [ ] `tasks.md` es una lista ordenada; cada ítem es verificable.
- [ ] El código en `src/` cubre los criterios; no queda lógica de producto solo en `current/`.
- [ ] Si hubo decisión de diseño, existe ADR y enlace en la constitución si aplica.
- [ ] `current/<id>/` se archiva o se borra; no se commitea.

## Qué puede hacer un agente en `current/`

Escribir borradores de tipos, ejemplos de asientos, tablas de estados, prompts y notas.  
No tratar esos archivos como API pública ni importarlos desde `src/`.
