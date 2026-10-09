# ADR 0008: Liberación gradual de una sola versión

- **Estado:** Aceptada
- **Fecha:** 2026-10-09
- **Artículo constitucional:** §2.8

## Contexto

El servidor y el cliente viven en el mismo proceso Next.js. No se pueden ejecutar dos builds históricos a la vez. Aun así, una release no debe entrar a todos los cuentahabientes en el momento del despliegue: el administrador tiene que poder probarla con personas concretas y abrirla por porcentajes, también en una fecha futura.

El service worker activaba el precache nuevo en cuanto se instalaba (`skipWaiting`). Eso entrega la versión a todo el mundo.

## Decisión

Una release es el build de Next.js, servidor y cliente juntos. Al conectar, si ese build no tiene fila, se crea con porcentaje 0.

Es candidato:

- cualquier administrador
- un cuentahabiente incluido en la lista de esa release
- un cuentahabiente cuyo cubo estable (`sha256(buildId + ":" + userId)`, 0–99) es menor que el porcentaje vigente

El porcentaje vigente es el mayor entre el porcentaje manual y los escalones cuya fecha ya pasó. Se calcula al leer. No hay un proceso aparte.

La cookie `praxis_release` guarda el build que el cliente ya tomó. No es la cookie de sesión. Si el usuario es candidato y la cookie no coincide, ve un aviso: cargarla ahora, o posponer. Posponer deja esta vista quieta; el siguiente refresh aplica esa release sin volver a preguntar.

El worker no hace `skipWaiting` hasta ese momento. Quien no es candidato conserva el cliente anterior. El proceso en marcha ya es el build nuevo; esta decisión no guarda una pila de servidores viejos. El id aceptado queda en la cookie para que una spec posterior pueda bifurcar comportamiento.

La gestión está en Configuración. No hay una tercera pantalla ni un tercer rol.

## Consecuencias

- El primer aviso solo aparece en clientes que ya incluyen esta release. Un build anterior no sabe preguntar.
- En `bun dev` el worker no se registra. El aviso igual se puede comprobar comparando la cookie con el build del servidor.
- Subir el porcentaje no expulsa a quien ya estaba dentro: el cubo no cambia.
- No se introduce otro runtime ni un enrutador de dos despliegues.
