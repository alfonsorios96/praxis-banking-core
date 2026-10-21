# MongoDB

Base: `MONGODB_DB` o `praxis`. Conexión: `MONGODB_URI`.

## `users` (implementada)

| Campo | Tipo | Notas |
| --- | --- | --- |
| username | string | Único, minúsculas, 2–64. |
| fullName | string | Opcional, hasta 120. Vacío si no hay nombre. |
| passwordHash | string | bcrypt. No se selecciona por defecto. |
| role | `"administrador"` \| `"cuentahabiente"` | Obligatorio. El valor `user` ya no es válido. |
| createdAt / updatedAt | date | `timestamps` de Mongoose. |

Índice único en `username`.

## `platform_settings` (implementada)

Un documento. Lo escribe identidad. No guarda dinero.

| Campo | Tipo | Notas |
| --- | --- | --- |
| key | string | Único. Valor `default`. |
| displayName | string | 2–40. Nombre visible en la cabecera autenticada. |
| simulateDigitalCardFaults | boolean | Por defecto `true`. Encendido, 2 de cada 5 emisiones digitales fallan ([ADR 0017](../decisions/0017-monitoring-y-emision-digital.md)). |
| digitalIssuanceSlot | number | Entero, por defecto `0`. Cupo global de intentos con la simulación encendida. |
| createdAt / updatedAt | date | `timestamps` de Mongoose. |

## `releases` (retirada)

El código ya no la lee ni la escribe ([ADR 0014](../decisions/0014-canary-por-modulos.md)). Si existe en Atlas, se puede borrar a mano.

## `accounts` (implementada)

La crea el arranque, después de los usuarios. No guarda saldo. El administrador no tiene filas.

| Campo | Tipo | Notas |
| --- | --- | --- |
| ownerId | string \| null | Id del cuentahabiente. `null` solo en tesorería. |
| kind | `"checking"` \| `"savings"` \| `"treasury"` | Corriente, Ahorro o tesorería. |
| label | string | Hasta 80. Corriente, Ahorro o Tesorería. |
| iban | string | Único. IBAN español `ES` + 22 dígitos. |
| status | `"open"` \| `"frozen"` \| `"closed"` | El alta nace `open`. |
| currency | `"EUR"` | |
| createdAt / updatedAt | date | `timestamps` de Mongoose. |

Índice único `(ownerId, kind)`. Índice único parcial en `iban` cuando es texto.

## `transfers` (implementada)

La escribe el flujo de traspaso, en la misma transacción que el asiento. No es la fuente del saldo.

| Campo | Tipo | Notas |
| --- | --- | --- |
| fromAccountId | string | Cuenta propia debitada. |
| toAccountId | string | Corriente del destinatario. |
| money | `{ currency, amountMinor }` | Céntimos de euro enteros. |
| status | `"proposed"` \| `"confirmed"` \| `"rejected"` | Este flujo solo inserta `confirmed`. |
| idempotencyKey | string | Única. La trae el formulario de confirmación. |
| createdAt / updatedAt | date | `timestamps` de Mongoose. |

## `ledger_entries` (implementada)

Única escritura de dinero. La inserta `src/ledger/`.

| Campo | Tipo | Notas |
| --- | --- | --- |
| idempotencyKey | string | Única. Apertura: `opening:{accountId}`. |
| postings | array | Al menos dos. `accountId`, `side` (`debit` \| `credit`), `money`. |
| createdAt / updatedAt | date | `timestamps` de Mongoose. |

El saldo de una cuenta es la suma de sus créditos menos sus débitos. El alta acredita al titular y debita tesorería.

## `device_tokens` (implementada)

La escribe el módulo de notificaciones cuando un cuentahabiente activa los avisos en un navegador. No guarda dinero. Un token pertenece a un solo usuario: registrarlo de nuevo cambia el `userId`.

| Campo | Tipo | Notas |
| --- | --- | --- |
| userId | string | Id del cuentahabiente. |
| token | string | Único. Token de registro de FCM. |
| createdAt / updatedAt | date | `timestamps` de Mongoose. |

Índice en `userId`. Índice único en `token`.

## `module_access` (implementada)

La escribe Configuración. No guarda dinero. Sin fila, o sin campo, el módulo está activo.

| Campo | Tipo | Notas |
| --- | --- | --- |
| userId | string | Único. Id del cuentahabiente. |
| cards | boolean | Tarjetas. |
| payments | boolean | Pagos. |
| transfers | boolean | Transferencias. |
| createdAt / updatedAt | date | `timestamps` de Mongoose. |

## `cards` (implementada)

El arranque crea un plástico por cuenta corriente o de ahorro. El titular añade tarjetas digitales a su corriente ([ADR 0017](../decisions/0017-monitoring-y-emision-digital.md)). Solo el titular cambia el estado. No guarda el número completo ni el CVV ([ADR 0015](../decisions/0015-tarjetas-de-debito-simuladas.md)).

| Campo | Tipo | Notas |
| --- | --- | --- |
| ownerId | string | Id del cuentahabiente. |
| accountId | string | Cuenta vinculada. Única entre los plásticos. |
| medium | `"plastic"` \| `"digital"` | Por defecto `plastic`. El arranque rellena los que no lo tienen. |
| kind | `"checking"` \| `"savings"` | Clase de la cuenta vinculada. |
| brand | `"visa"` | Marca mostrada. |
| last4 | string | 4 dígitos del número de prueba. |
| expMonth / expYear | number | Caducidad. |
| status | `"active"` \| `"frozen"` \| `"cancelled"` | Por defecto `active`. |
| limitMinor | number | Límite diario en céntimos, entero. Informativo. |
| createdAt / updatedAt | date | `timestamps` de Mongoose. |

Índice único parcial en `accountId` cuando `medium` es `plastic` (`accountId_plastic`). Índice en `ownerId`. El arranque borra el índice único antiguo `accountId_1` si existe.

## `incidents` (implementada)

La escribe la emisión digital cuando falla a propósito. La lee Monitoring. No guarda dinero, número de tarjeta ni IBAN.

| Campo | Tipo | Notas |
| --- | --- | --- |
| code | number | Código del fallo. Hoy `500`. |
| concept | string | Concepto inventado. Hoy `emisor-virtual-no-responde`. |
| operation | string | Operación fallida. Hoy `emitir-tarjeta-digital`. |
| ownerId | string | Id del cuentahabiente. Monitoring no lo muestra. |
| createdAt / updatedAt | date | `timestamps` de Mongoose. |

Índice en `createdAt`.

## Colecciones futuras

No se crean modelos ni índices hasta la spec que las introduzca.

| Colección | Dueño | Contenido previsto |
| --- | --- | --- |
| `payments` | payments | Propuesta de pago e `idempotencyKey`. |
