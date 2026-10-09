# Glosario

Términos del core. Los esquemas de frontera viven en `src/domain`. Las colecciones que aún no existen están descritas en [`mongo.md`](./mongo.md).

| Término | Significado |
| --- | --- |
| Usuario | Cuenta de acceso con rol único `user`. Entra con usuario y contraseña. No es todavía un titular con cuentas. |
| Sesión | JWT en cookie HttpOnly que acredita al usuario autenticado. |
| Cuenta | Relación del titular con el banco. Tiene estado `open`, `frozen` o `closed` y moneda `MXN`. No guarda el saldo. |
| Saldo | Suma de los asientos del ledger sobre una cuenta. No es un campo que se edite. |
| Tarjeta | Instrumento asociado a una cuenta. Estado `active`, `frozen` o `cancelled`. Tiene un límite en centavos. No autoriza cargos por sí misma. |
| Transferencia | Propuesta de traspaso de una cuenta a otra, con importe en centavos y clave de idempotencia. Estados: `proposed`, `confirmed`, `rejected`. |
| Pago | Propuesta de pago a un comercio o servicio, con los mismos estados y la misma clave de idempotencia. |
| Asiento | Registro del ledger con al menos dos postings balanceados (débitos = créditos, en centavos). |
| Posting | Línea de un asiento: cuenta, lado `debit` o `credit`, e importe. |
| Centavo | Unidad menor de MXN. El entero `amountMinor` es la fuente de verdad. |
| Confirmación | Acto explícito del titular antes de un efecto sobre el saldo. |
| Orquestador | Agente que descompone y consolida el trabajo de los sub-agentes. |
