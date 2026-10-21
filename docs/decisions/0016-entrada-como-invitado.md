# ADR 0016: Entrada como invitado

- **Estado:** Aceptada
- **Fecha:** 2026-10-21
- **Artículo constitucional:** §2.7

## Contexto

Para las demos, una persona tiene que poder entrar sin que el administrador le cree antes un usuario. La constitución decía que no hay registro público y el ADR 0007 pedía una enmienda para abrirlo.

## Decisión

- `/login` ofrece «Entrar como invitado». Pide un nombre y crea un `cuentahabiente`. Es el único camino público de alta.
- El usuario es `demo-<iniciales>-NNN`: primera letra de cada palabra del nombre, sin acentos, en minúsculas, hasta 4 letras, y un consecutivo de tres dígitos por prefijo. El nombre queda en `fullName`.
- Todos los invitados comparten la contraseña de demo `Praxis123!`.
- El alta abre Corriente y Ahorro y emite sus tarjetas, en el momento. La Corriente abre con 500,00 € (50 000 céntimos); el Ahorro, con los 5.000,00 € del ADR 0009. Es el mismo asiento `opening:{accountId}` desde tesorería.
- El invitado nace con Cuentas y Transferencias, y con Tarjetas y Pagos retirados (`module_access`). El administrador puede cambiarlos desde Configuración.
- El alta abre sesión y lleva a Inicio.

## Consecuencias

- Cualquiera con acceso a `/login` puede crear cuentahabientes. Es aceptable en un entorno de demo con dinero simulado.
- La contraseña es conocida: un invitado no protege nada.
- Sigue prohibido un registro con contraseña elegida y cualquier rol distinto de `cuentahabiente`.
- La constitución pasa a 4.0.0: el §2.7 admite esta excepción.
