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

## Colecciones futuras

No se crean modelos ni índices hasta la spec que las introduzca.

| Colección | Dueño | Contenido previsto |
| --- | --- | --- |
| `accounts` | accounts | Cuenta, titular, estado, moneda. Sin saldo. |
| `cards` | cards | Tarjeta, cuenta, últimos 4, estado, límite en centavos. |
| `transfers` | transfers | Propuesta de traspaso e `idempotencyKey`. |
| `payments` | payments | Propuesta de pago e `idempotencyKey`. |
| `ledger_entries` | ledger | Asiento y postings. Única escritura de dinero. |
