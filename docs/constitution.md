# Constitución de Praxis

**Versión:** 2.3.0  
**Ratificada:** 2026-10-09  
**Enmendada:** 2026-10-09 ([ADR 0010](./decisions/0010-iban-y-euro.md))  
**Alcance:** Toda decisión, especificación, agente y línea de código de este repositorio.

Esta constitución es la norma de mayor rango del proyecto. Ninguna especificación, ADR, prompt de agente ni implementación puede contradecirla. Si hay conflicto, se corrige el artefacto inferior o se enmienda esta constitución mediante una decisión ratificada en `docs/decisions/`.

---

## 1. Misión

Praxis es un harness de agentes cuya misión es **automatizar y ayudar las operaciones de un core bancario**: usuarios, cuentas, tarjetas, transferencias y pagos.

Los agentes no sustituyen al titular ni al control del banco: **proponen, estructuran, contrastan y documentan**. Cualquier efecto sobre un saldo exige confirmación explícita del titular. Toda cifra de dinero debe ser trazable hasta un asiento.

Esta versión autentica, navega y abre para cada cuentahabiente una cuenta corriente y una de ahorro, cada una con su IBAN en euros. Un traspaso interno mueve dinero solo después de la confirmación del titular, mediante un asiento del ledger. No emite tarjetas ni pagos.

---

## 2. Principios

### 2.1 Spec-Driven Development

Ninguna funcionalidad entra en `src/` sin una especificación activa en `current/` (trabajo guiado por IA) o sin una decisión ya ratificada en `docs/`. El código implementa la spec; la spec no se escribe a posteriori para justificar el código.

### 2.2 Constitución, luego decisiones, luego spec, luego código

Orden de precedencia:

1. Esta constitución
2. Decisiones ratificadas en `docs/decisions/`
3. Especificación de la tarea en `current/<tarea>/`
4. Código, prompts y datos

### 2.3 Dinero entero y ledger único

Los importes se representan en **enteros de la unidad menor** (céntimos). La moneda es **EUR**. Queda prohibido usar `number` de punto flotante para dinero.

El saldo de una cuenta no es un campo editable. Solo el agente **ledger** puede registrar asientos, y el saldo se deriva de ellos. Un movimiento que afecte saldo es idempotente: la misma clave de idempotencia no produce un segundo asiento.

### 2.4 Humanos en el bucle

Los agentes proponen. Transferir, pagar, emitir o bloquear un instrumento con efecto económico requiere confirmación explícita del titular, salvo que una decisión posterior autorice un flujo automático acotado.

### 2.5 `current/` es efímero; `docs/` es constitución viva

`current/` guarda el trabajo parcial de una tarea guiada por IA. No es fuente de verdad del producto. Las decisiones que sobrevivan a la tarea se promueven a `docs/decisions/` (y, si cambian la ley del proyecto, se enmienda esta constitución).

### 2.6 Stack tecnológico

No se introduce runtime, marco, base de datos ni librería de autenticación distinta sin ADR. El stack canónico es:

| Capa | Tecnología |
| --- | --- |
| App web y API | Next.js (App Router) |
| Lenguaje | TypeScript estricto |
| Runtime local y paquetes | Bun |
| UI | React, Tailwind CSS, lucide-react |
| PWA | Manifest, iconos y service worker (Serwist) |
| Persistencia | MongoDB Atlas (Mongoose) |
| Validación | Zod |
| Sesión | JWT HS256 (`jose`) en cookie HttpOnly |
| Contraseñas | bcryptjs |

Detalle: [ADR 0001](./decisions/0001-stack-tecnologico.md), [ADR 0004](./decisions/0004-mongodb-y-autenticacion.md), [ADR 0006](./decisions/0006-pwa-mobile-first.md). Esquema Atlas: [`docs/domain/mongo.md`](./domain/mongo.md).

### 2.7 Acceso autenticado

La aplicación exige identidad. Hay dos roles, y ningún otro sin enmienda:

- `administrador` — Inicio (paneles de la plataforma) y Configuración. No entra a cuentas, tarjetas, transferencias ni pagos.
- `cuentahabiente` — Inicio, Cuentas, Tarjetas, Transferencias y Pagos. No entra a Configuración.

Autenticación por **usuario y contraseña**. No hay registro público.

Rutas de producto y APIs de negocio son privadas. Quedan públicas `/login`, el health check y los assets de instalación de la PWA (`/manifest.webmanifest`, `/sw.js` y los iconos). Una ruta ajena al rol redirige a Inicio. Las acciones con efecto sobre saldo siguen requiriendo confirmación del titular (§2.4) **además** de la sesión. Un rol no sustituye esa confirmación.

### 2.8 Interfaz mobile-first

La interfaz se diseña para el teléfono y se instala como PWA. En escritorio se presenta como una columna de teléfono. Objetivos táctiles grandes, barra de navegación inferior y respeto a las áreas seguras. Ver [ADR 0006](./decisions/0006-pwa-mobile-first.md).

Una release es el build de Next.js, servidor y cliente juntos. No se ejecutan dos builds históricos en paralelo. El administrador la abre desde Configuración por porcentaje, por fecha o por cuentahabiente concreto. El administrador siempre es candidato. El service worker no activa un precache nuevo hasta que la persona carga esa release: puede hacerlo al ver el aviso o en el siguiente refresh si lo pospuso. Quien no es candidato conserva el cliente anterior. Ver [ADR 0008](./decisions/0008-liberacion-gradual.md).

---

## 3. Agentes y sub-agentes

Todo agente declara: misión, entradas, salidas, herramientas permitidas y lo que **no** puede hacer.

| Agente | Misión |
| --- | --- |
| Orquestador | Descompone la petición, asigna sub-agentes, consolida el resultado y pide confirmación del titular cuando la meta afecte un saldo. |
| Identidad | Usuarios, credenciales, perfil y los roles administrador y cuentahabiente. No abre cuentas ni mueve dinero. |
| Cuentas | Cuentas, titularidad y estado (abierta, congelada, cerrada). No muta saldos. |
| Tarjetas | Plástico, estado y límites. No autoriza cargos. |
| Transferencias | Propone traspasos entre cuentas. No escribe asientos. |
| Pagos | Propone pagos a un comercio o servicio. No escribe asientos. |
| Ledger | Única escritura de asientos. El saldo se deriva de ellos. |

Un sub-agente no escribe fuera de su dominio. El orquestador es el único que compone un resultado multi-dominio. Transferencias y pagos entregan una propuesta al ledger; no persisten el saldo por su cuenta.

En esta versión los contratos existen y el orquestador no despacha todavía.

---

## 4. Harness de trabajo (SDD)

Flujo obligatorio para tareas guiadas por IA:

1. **Specify** — copiar `current/_template/` a `current/<id-kebab>/` y redactar `spec.md`.
2. **Plan** — `plan.md` alineado a constitución y ADRs.
3. **Tasks** — `tasks.md` con criterios de aceptación comprobables.
4. **Build** — implementar en `src/`; artefactos intermedios solo en `current/<id>/`.
5. **Decide** — si hay decisión de diseño, abrir ADR en `docs/decisions/`.
6. **Promote or discard** — al cerrar la tarea, promover lo permanente a `src/` y `docs/`; vaciar o archivar `current/<id>/`.

Detalle operativo: [Spec-Driven Development](./processes/spec-driven-development.md).

---

## 5. Enmiendas

1. Redactar un ADR en `docs/decisions/` con el cambio propuesto y el artículo constitucional afectado.
2. Actualizar el número de versión de esta constitución (MAJOR si cambia un principio; MINOR si aclara o añade un agente o proceso).
3. Enlazar el ADR desde este documento.

Sin ADR, no hay enmienda.

---

## 6. Artículos ratificados

| ID | Título |
| --- | --- |
| [0001](./decisions/0001-stack-tecnologico.md) | Stack: Next.js, Bun, TypeScript |
| [0002](./decisions/0002-spec-driven-development.md) | Harness SDD (`current/` y `docs/`) |
| [0003](./decisions/0003-agentes-y-dominio.md) | Dominio bancario y agentes |
| [0004](./decisions/0004-mongodb-y-autenticacion.md) | MongoDB Atlas y autenticación |
| [0005](./decisions/0005-dinero-y-confirmacion.md) | Dinero en centavos, ledger y confirmación |
| [0006](./decisions/0006-pwa-mobile-first.md) | PWA mobile-first |
| [0007](./decisions/0007-roles-administrador-y-cuentahabiente.md) | Roles administrador y cuentahabiente |
| [0008](./decisions/0008-liberacion-gradual.md) | Liberación gradual de una sola versión |
| [0009](./decisions/0009-cuentas-y-transferencias-internas.md) | Cuentas y transferencias internas |
| [0010](./decisions/0010-iban-y-euro.md) | IBAN español y euro |
