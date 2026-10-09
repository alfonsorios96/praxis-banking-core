# ADR 0003: Agentes y dominio bancario

- **Estado:** Aceptada
- **Fecha:** 2026-10-09
- **Artículo constitucional:** §1, §3

## Contexto

El producto no es un chatbot genérico: es un core bancario (usuarios, cuentas, tarjetas, transferencias y pagos) operado por un orquestador y sub-agentes con dominios separados.

## Decisión

El dominio canónico vive en `src/domain` como esquemas Zod de frontera. Los agentes viven en `src/agents` como contratos (misión, entrada, salida) orquestados por un único orquestador.

Los agentes son: `orchestrator`, `identity`, `accounts`, `cards`, `transfers`, `payments` y `ledger`.

Ningún sub-agente persiste estado de otro dominio. Transferencias y pagos producen propuestas. Solo `ledger` podrá escribir asientos. En esta versión el orquestador no despacha sub-agentes: devuelve la meta, la lista de delegados vacía y si la meta exige confirmación humana.

## Consecuencias

- Un agente nuevo requiere enmienda constitucional §3 o un ADR que la actualice.
- Las reglas de saldo, límite de tarjeta o idempotencia no se hardcodean en la UI: pertenecen a ledger, tarjetas o transferencias.
- No se añaden repositorios ni rutas de cuentas, tarjetas, transferencias o pagos hasta que exista una spec en `current/`.
