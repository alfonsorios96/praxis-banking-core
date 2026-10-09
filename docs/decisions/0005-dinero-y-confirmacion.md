# ADR 0005: Dinero en centavos, ledger y confirmación

- **Estado:** Aceptada
- **Fecha:** 2026-10-09
- **Artículo constitucional:** §2.3, §2.4

## Contexto

Un core bancario pierde integridad si el saldo es un número editable o un flotante. Aunque esta versión no mueve dinero, la representación queda fijada antes de la primera spec de cuentas.

## Decisión

- Moneda de arranque: **MXN**.
- Un importe es `{ currency: "MXN", amountMinor: number }` donde `amountMinor` es un entero de centavos, mayor o igual que cero en las propuestas de movimiento.
- Una cuenta no almacena saldo. El saldo futuro será la suma firmada de asientos del ledger.
- Un asiento tiene al menos dos postings y queda balanceado: la suma de débitos en centavos es igual a la suma de créditos.
- Transferencias y pagos llevan `idempotencyKey`. Repetir la clave no crea otro asiento.
- El orquestador marca `requiresHumanConfirmation` cuando la meta afecta saldo, por el texto de la meta o por el flag `affectsBalance`.

## Consecuencias

- Queda prohibido persistir dinero como `double`, `number` decimal de JavaScript o string formateado (`"$1,234.50"`) como fuente de verdad.
- La UI podrá formatear centavos para mostrarlos; el valor canónico sigue siendo el entero.
- Esta versión no escribe asientos. El invariante de balance vive como función pura en `src/domain` para que las specs posteriores lo reutilicen.
