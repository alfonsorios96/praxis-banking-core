<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Praxis — agentes

1. Lee `docs/constitution.md` y `docs/decisions/` antes de cambiar comportamiento.
2. Tareas guiadas por IA: crea `current/<id>/` (`bun run sdd:new -- --id <id>`) y completa spec, plan y tasks antes de implementar en `src/`.
3. Dominio: core bancario. Sub-agentes: identity, accounts, cards, transfers, payments, ledger. El orquestador es el único que compone un resultado multi-dominio.
4. Dinero: enteros en centavos MXN. El saldo no se edita en la cuenta. Solo ledger escribe asientos, y aún no está implementado.
5. Runtime: Bun. No introduzcas npm, yarn ni pnpm ni un framework distinto sin ADR.
6. Persistencia: MongoDB Atlas (`MONGODB_URI`). Auth: roles `administrador` y `cuentahabiente`, sesión JWT, rutas protegidas salvo `/login`, `/api/health`, el manifest y el service worker. El administrador solo entra a Inicio y Configuración.
7. UI: columna de teléfono, navegación inferior, PWA. No diseñes primero para escritorio.
