# ADR 0017: Monitoring y emisión digital con fallos simulados

- **Estado:** Aceptada
- **Fecha:** 2026-10-21
- **Artículo constitucional:** §1, §2.7, §2.8, §3

## Contexto

En las demos queremos enseñar qué ve el banco cuando una operación crítica falla en producción y cómo se apaga. No hay telemetría ni ninguna operación que falle de forma controlada. Además, el administrador trabaja en un escritorio: la columna de teléfono le estorba.

## Decisión

- El cuentahabiente puede crear tarjetas digitales en Tarjetas. Cada una se vincula a su cuenta corriente, se guarda en `cards` con `medium: "digital"` y se puede congelar. Número y CVV de prueba salen del id de la tarjeta, no del de la cuenta. Crear una tarjeta digital no mueve saldo, así que no pide la confirmación del §2.4.
- El plástico sigue siendo uno por cuenta (`medium: "plastic"`, índice único parcial en `accountId`).
- Con «Simular fallos de emisión digital» encendido, cada intento consume un cupo global atómico en `platform_settings`. Los cupos cuyo resto entre 5 es 1 o 2 fallan: 2 de cada 5. El fallo no crea tarjeta, guarda un incidente en `incidents` con código `500` y concepto `emisor-virtual-no-responde`, y el titular solo ve un aviso de que estamos trabajando en ello. Apagado, la emisión siempre se completa y no hay incidentes.
- El administrador tiene una tercera pantalla, Monitoring (`/monitoreo`): total de fallos, barras por minuto de los últimos 15 minutos, pastel por concepto y el interruptor. Los gráficos son SVG propio. El interruptor está encendido por defecto.
- La interfaz del administrador (Inicio, Monitoring y Configuración) se diseña para escritorio, con navegación lateral. La del cuentahabiente y el login siguen en la columna de teléfono del [ADR 0006](./0006-pwa-mobile-first.md).

## Consecuencias

- Los fallos son inventados y solo sirven para la demo. No hay registro de éxitos, latencias ni telemetría externa.
- `incidents` no guarda número de tarjeta, saldo ni IBAN, y Monitoring no muestra quién falló.
- La prohibición del ADR 0006 de un layout de escritorio queda acotada al cuentahabiente.
- El agente Tarjetas emite instrumentos sin efecto económico. Sigue sin autorizar cargos.
- La constitución pasa a 4.1.0.
