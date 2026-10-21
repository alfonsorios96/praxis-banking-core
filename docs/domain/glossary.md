# Glosario

Términos del core. Los esquemas de frontera viven en `src/domain`. Las colecciones están descritas en [`mongo.md`](./mongo.md).

| Término | Significado |
| --- | --- |
| Usuario | Cuenta de acceso con rol `administrador` o `cuentahabiente`. Entra con usuario y contraseña. |
| Administrador | Rol que ve los paneles de inicio y configura el nombre visible y los módulos de cada cuentahabiente. No opera cuentas ni instrumentos. |
| Canary | Abrir un módulo a una persona antes que a las demás, ampliarlo después y revertirlo si falla. Etapas: Apagado, Canario, Parcial y Todos. |
| Cuentahabiente | Rol que navega inicio, cuentas, tarjetas, transferencias y pagos. Es titular de una corriente y una de ahorro, cada una con IBAN y una tarjeta de débito simulada. Pagos sigue en espera de spec. |
| Sesión | JWT en cookie HttpOnly que acredita al usuario autenticado. |
| Cuenta | Relación del titular con el banco. Clase `checking` (Corriente) o `savings` (Ahorro), estado `open`, `frozen` o `closed`, moneda `EUR`, identificada por un IBAN español. No guarda el saldo. La tesorería es una cuenta interna sin titular y también tiene IBAN. |
| Saldo | Suma de los asientos del ledger sobre una cuenta. No es un campo que se edite. |
| Tarjeta | Débito simulado asociado a una cuenta, una por cuenta. Estado `active`, `frozen` o `cancelled`; el titular congela y descongela. Tiene un límite diario en céntimos, informativo. No autoriza cargos. El número y el CVV son de prueba y no se guardan. |
| Transferencia | Traspaso interno confirmado: debita una cuenta del titular y abona la corriente de otro cuentahabiente. Importe en céntimos y clave de idempotencia. Estados: `proposed`, `confirmed`, `rejected`. |
| Pago | Propuesta de pago a un comercio o servicio, con los mismos estados y la misma clave de idempotencia. |
| Asiento | Registro del ledger con al menos dos postings balanceados (débitos = créditos, en céntimos). |
| Posting | Línea de un asiento: cuenta, lado `debit` o `credit`, e importe. |
| Céntimo | Unidad menor de EUR. El entero `amountMinor` es la fuente de verdad. |
| IBAN | Identificador español de la cuenta: `ES` y 22 dígitos. Único. No es el saldo. |
| Confirmación | Acto explícito del titular antes de un efecto sobre el saldo. |
| Orquestador | Agente que descompone y consolida el trabajo de los sub-agentes. |
