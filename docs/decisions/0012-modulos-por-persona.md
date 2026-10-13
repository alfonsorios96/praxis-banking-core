# ADR 0012: Módulos por persona

- **Estado:** Aceptada
- **Fecha:** 2026-10-13
- **Artículo constitucional:** §2.6, §2.7

## Contexto

Tarjetas, Pagos y Transferencias se abren hoy a todo cuentahabiente por su rol. El administrador necesita retirar o devolver uno de esos módulos a personas concretas sin desplegar otro build. La versión de la app sigue siendo el build ([ADR 0008](./0008-liberacion-gradual.md)); esta decisión no crea versiones por módulo.

## Decisión

- Hay tres módulos conmutables: `cards` (`/tarjetas`), `payments` (`/pagos`) y `transfers` (`/transferencias`). Inicio y Cuentas no se conmutan.
- La colección `module_access` guarda una fila por cuentahabiente con los tres booleanos. Sin fila, o sin campo, el módulo está activo.
- El administrador elige en Configuración un módulo, varias personas y Activar o Desactivar. Solo se escribe a quien de verdad cambia. Los demás conservan su estado.
- Un módulo apagado no aparece en la barra. Su ruta redirige a Inicio desde el servidor. La acción de traspaso rechaza el envío si Transferencias está apagada, aunque un cliente viejo muestre el formulario. El proxy sigue mirando solo el rol.
- A quien cambió le llega un aviso por el canal del [ADR 0011](./0011-notificaciones-push.md). Es un mensaje de datos. Un toque abre el módulo si queda activo, o Inicio si queda apagado. Al recargar, el servidor pinta el estado guardado.
- Si faltan credenciales, FCM falla o no hay tokens, el cambio ya está guardado y no se revierte.

## Consecuencias

- La constitución pasa a 2.5.0. El §2.7 dice que el rol permite esas rutas y que el administrador puede retirarlas persona a persona. El §2.6 añade este aviso al canal push.
- Quien pospuso la release conserva el worker anterior y no recibe el aviso hasta activarla. El servidor aplica el estado igual.
- No hay porcentajes ni fechas por módulo. Un rollout por módulo exige otra decisión.
- Un alta nueva nace con los tres módulos.
