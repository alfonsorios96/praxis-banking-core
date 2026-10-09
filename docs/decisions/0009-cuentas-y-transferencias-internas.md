# ADR 0009: Cuentas y transferencias internas

- **Estado:** Aceptada
- **Fecha:** 2026-10-09
- **Artículo constitucional:** §1, §2.3, §2.4

## Contexto

El §2.3 ya fija el dinero en centavos y un solo escritor de asientos. El §2.4 ya exige confirmación del titular antes de un efecto sobre el saldo. El §1, en cambio, decía que esta versión no abre cuentas ni mueve dinero. Sin esa aclaración, el primer traspaso interno contradiría la misión escrita.

Cada cuentahabiente necesita una cuenta de ahorro y una de cheques. El administrador no opera cuentas. El saldo no puede guardarse en la cuenta.

## Decisión

- Al conectar, si a un cuentahabiente le falta Ahorro o Cheques, se crean abiertas, en MXN, sin campo de saldo. Índice único `(ownerId, kind)`.
- Hay una cuenta interna de tesorería, sin titular. Solo existe para que el asiento de apertura cuadre. No se muestra y no se puede elegir como origen ni destino.
- El alta de saldo es un asiento, una sola vez, con clave `opening:{accountId}`:
  - Cheques: 1 000 000 centavos ($10,000.00)
  - Ahorro: 500 000 centavos ($5,000.00)
  - El débito va a tesorería y el crédito a la cuenta del titular.
- Una transferencia interna debita una cuenta abierta del titular y abona la Cheques abierta del otro cuentahabiente. El destino no se elige.
- El ledger rechaza importe cero, origen ajeno, destinatario uno mismo o que no sea cuentahabiente, cuenta que no esté abierta y saldo insuficiente.
- El botón de confirmar es la confirmación del titular. La clave de idempotencia viaja en ese envío. Repetirla no crea otro asiento.
- Solo `src/ledger/` inserta asientos. La acción del servidor la llama; el orquestador sigue sin despachar. Tarjetas y pagos no entran.

## Consecuencias

- El §1 queda aclarado: ya hay cuentas y traspasos internos. La versión de la constitución pasa a 2.2.0. Los principios de centavos, ledger único y confirmación no cambian.
- El [ADR 0010](./0010-iban-y-euro.md) sustituye el peso y el nombre Cheques: la moneda es EUR, la cuenta operativa es la corriente y cada cuenta tiene un IBAN español. El resto de esta decisión sigue vigente.
- La frase del ADR 0005 que decía que esta versión no escribe asientos queda limitada por esta decisión: sí se escriben el alta y los traspasos internos.
- No hay SPEI, CLABE, alta manual de más cuentas, ni congelar o cerrar.
