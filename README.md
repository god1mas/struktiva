# Struktiva

Interactive Data Structures Learning Platform.

The repository includes the shared deterministic simulation core and the
[Singly Linked List reference visualizer](./docs/linked-list-reference.md).
Product scope and architecture decisions are canonical in [`docs/`](./docs/).

## Local setup

1. Install Node.js 24 and pnpm 12.
2. Copy `.env.example` to `.env` and replace the local-only auth secret.
3. Start PostgreSQL with `docker compose up -d`. The project maps PostgreSQL to host port `5433` to avoid the commonly occupied default port.
4. Install dependencies with `pnpm install`.
5. Apply migrations with `pnpm prisma migrate dev`.
6. Start the app with `pnpm dev`.

## Verification

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`
- `pnpm verify`
