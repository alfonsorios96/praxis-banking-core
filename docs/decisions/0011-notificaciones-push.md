# ADR 0011: Notificaciones push al recibir una transferencia

- **Estado:** Aceptada
- **Fecha:** 2026-10-13
- **Artículo constitucional:** §2.3, §2.4, §2.6, §2.8

## Contexto

Un traspaso interno ya mueve euros cuando el titular lo confirma, y el asiento queda en el ledger. El destinatario solo se entera si abre la app. La interfaz es una PWA con un service worker de Serwist; no hay app nativa.

Hace falta un canal de avisos. Firebase Cloud Messaging no está en el stack y trae dos librerías. El aviso no puede convertirse en un segundo escritor de saldo ni bloquear el commit.

## Decisión

- El canal es Firebase Cloud Messaging en la web. Librerías: `firebase` en el cliente (solo messaging) y `firebase-admin` en el servidor. No hay otra librería de push.
- El mismo service worker (`src/sw.ts`, Serwist) recibe el mensaje en segundo plano. No se publica un `firebase-messaging-sw.js`. En `next dev` el worker sigue sin registrarse, así que el alta no se ofrece.
- Cada navegador guarda un token de registro en `device_tokens` (`userId`, `token` único). Solo el cuentahabiente de la sesión puede registrar el suyo. Al salir, ese token se borra. Volver a registrar un token lo reasigna al usuario actual.
- El aviso sale después del commit de `confirmInternalTransfer`, y solo si el resultado no es un duplicado de idempotencia. Va al destinatario, no al emisor. El texto lleva el importe en euros y el nombre visible del emisor. No lleva IBAN ni ids.
- El mensaje es de datos. El worker muestra la notificación. Un toque abre `/transferencias`.
- Si faltan credenciales, FCM falla o el usuario no tiene tokens, no se revierte el asiento ni la transferencia. Un token que FCM da por no registrado se borra.
- La config web (`NEXT_PUBLIC_FIREBASE_*`, incluida la clave VAPID) puede ir al cliente. La cuenta de servicio (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) solo vive en el servidor. El worker incrusta la config pública en el build.

## Consecuencias

- La constitución pasa a 2.4.0. El §2.6 nombra este canal. Los principios de centavos, ledger único y confirmación del titular no cambian.
- Cambiar la config pública exige un build nuevo: el worker no la lee en caliente.
- Quien pospone la release ([ADR 0008](./0008-liberacion-gradual.md)) conserva el worker anterior y no recibe avisos hasta activarlo.
- En iOS el push web solo llega si la PWA está instalada. No se añade una app nativa.
- Tarjetas, pagos y el aviso al emisor quedan fuera.
