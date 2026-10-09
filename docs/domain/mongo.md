# MongoDB

Base: `MONGODB_DB` o `praxis`. Conexión: `MONGODB_URI`.

## `users` (implementada)

| Campo | Tipo | Notas |
| --- | --- | --- |
| username | string | Único, minúsculas, 2–64. |
| fullName | string | Opcional, hasta 120. Vacío si no hay nombre. |
| passwordHash | string | bcrypt. No se selecciona por defecto. |
| role | `"user"` | Único valor admitido. |
| createdAt / updatedAt | date | `timestamps` de Mongoose. |

Índice único en `username`.

## Colecciones futuras

No se crean modelos ni índices hasta la spec que las introduzca.

| Colección | Dueño | Contenido previsto |
| --- | --- | --- |
| `accounts` | accounts | Cuenta, titular, estado, moneda. Sin saldo. |
| `cards` | cards | Tarjeta, cuenta, últimos 4, estado, límite en centavos. |
| `transfers` | transfers | Propuesta de traspaso e `idempotencyKey`. |
| `payments` | payments | Propuesta de pago e `idempotencyKey`. |
| `ledger_entries` | ledger | Asiento y postings. Única escritura de dinero. |
