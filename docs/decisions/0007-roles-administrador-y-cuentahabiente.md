# ADR 0007: Roles administrador y cuentahabiente

- **Estado:** Aceptada
- **Fecha:** 2026-10-09
- **Artículo constitucional:** §2.7, §3

## Contexto

El shell tenía un único rol `user`. La operación de la plataforma y la navegación del core no son el mismo trabajo: quien configura no debe entrar a cuentas, tarjetas, transferencias ni pagos, y el cuentahabiente no debe configurar la plataforma.

## Decisión

Hay dos roles, y ningún otro sin enmienda:

- `administrador` — Inicio (paneles de la plataforma) y Configuración.
- `cuentahabiente` — Inicio, Cuentas, Tarjetas, Transferencias y Pagos.

El usuario `praxis` es administrador. La semilla asegura además tres cuentahabientes (`sofia`, `diego`, `valeria`) si no existen. No hay registro público. El rol viaja en el JWT. Una ruta ajena al rol redirige a Inicio. El rol `user` deja de aceptarse.

Configuración persiste el nombre visible de la plataforma. No hay saldos ni movimientos en los paneles: los conteos salen de `users`.

Esta decisión sustituye la frase de rol único del [ADR 0004](./0004-mongodb-y-autenticacion.md). El resto de ese ADR sigue vigente.

## Consecuencias

- Hay que entrar de nuevo si la sesión se emitió con el rol `user`.
- La semilla no reescribe una contraseña ya guardada.
- Un tercer rol, o abrir el registro, exige otra enmienda.
- Cuentas, tarjetas, transferencias, pagos y asientos siguen sin colección hasta su propia spec.
