# Glosario

Términos del core. Los esquemas de frontera viven en `src/domain`. Las colecciones que aún no existen están descritas en [`mongo.md`](./mongo.md).

| Término | Significado |
| --- | --- |
| Usuario | Cuenta de acceso con rol `administrador` o `cuentahabiente`. Entra con usuario y contraseña. El cuentahabiente aún no es un titular con cuentas de depósito. |
| Administrador | Rol que ve los paneles de inicio y configura el nombre visible y la release. No opera cuentas ni instrumentos. Siempre es candidato a la release actual. |
| Release | Build único de Next.js, servidor y cliente juntos. No hay dos procesos históricos a la vez. |
| Candidato | Quien puede tomar la release actual: todo administrador, un cuentahabiente de la lista, o uno cuyo cubo cae en el porcentaje vigente. |
| Cuentahabiente | Rol que navega inicio, cuentas, tarjetas, transferencias y pagos. Esas pantallas de producto siguen en espera de spec. |
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
