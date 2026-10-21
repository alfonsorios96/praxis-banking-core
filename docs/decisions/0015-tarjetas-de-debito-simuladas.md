# ADR 0015: Tarjetas de débito simuladas

- **Estado:** Aceptada
- **Fecha:** 2026-10-21
- **Artículo constitucional:** §1, §3

## Contexto

Tarjetas era un marcador vacío. El agente de tarjetas tiene por misión el plástico, el estado y los límites, sin autorizar cargos. Queremos que el cuentahabiente vea sus tarjetas y las congele sin abrir todavía cargos ni pagos.

## Decisión

- Cada cuenta corriente y de ahorro de un cuentahabiente tiene una tarjeta de débito. El arranque la crea, una sola vez, en la colección `cards`.
- La tarjeta es simulada. Se guardan los últimos 4 dígitos, la caducidad, el estado y un límite diario en céntimos. El número completo y el CVV no se guardan: salen de una función pura a partir del id de la cuenta, con un BIN de prueba y dígito de Luhn.
- La pantalla Tarjetas muestra los plásticos en un carrusel. El reverso enseña número, caducidad y CVV, marcados como datos de prueba.
- El cuentahabiente congela o descongela su tarjeta al instante. Congelar no mueve saldo, así que no pide la confirmación del §2.4.
- El estado `cancelled` existe en el esquema, pero la interfaz no lo ofrece.

## Consecuencias

- No hay cargos, autorizaciones ni movimientos de tarjeta. El ledger no cambia.
- El límite diario es informativo: nada lo consume todavía.
- La acción comprueba rol, módulo Tarjetas activo y titularidad antes de cambiar el estado.
- La constitución pasa a 3.1.0: el §1 deja de decir que no hay tarjetas.
