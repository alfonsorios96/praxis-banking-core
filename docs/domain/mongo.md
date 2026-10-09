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
| createdAt / updatedAt | date | `timestamps` de Mongoose. |

## `releases` (implementada)

Una fila por build de Next.js. La escribe la configuración. No guarda dinero. El build nuevo nace con porcentaje 0.

| Campo | Tipo | Notas |
| --- | --- | --- |
| buildId | string | Único. Id del build. |
| label | string | Hasta 80. Al nacer, igual que `buildId`. |
| percent | number | Entero 0–100. Suelo manual. |
| allowUserIds | string[] | Ids de cuentahabientes, además del porcentaje. |
| steps | `{ at, percent }[]` | Escalón. Cuenta cuando `at` ya pasó. |
| createdAt / updatedAt | date | `timestamps` de Mongoose. |

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

## Colecciones futuras

No se crean modelos ni índices hasta la spec que las introduzca.

| Colección | Dueño | Contenido previsto |
| --- | --- | --- |
| `cards` | cards | Tarjeta, cuenta, últimos 4, estado, límite en céntimos. |
| `payments` | payments | Propuesta de pago e `idempotencyKey`. |
