# Technical Architecture

## Technology contract

- Next.js 16 App Router and React 19
- TypeScript in strict mode
- Tailwind CSS 4
- Motion for React
- Better Auth with email/password authentication
- Prisma ORM 7 with the PostgreSQL driver adapter
- PostgreSQL 17
- Zod 4
- Vitest, React Testing Library, and Playwright

## Boundaries

React Server Components are the default. Client Components are introduced only for browser interaction or animation. Prisma and database access are server-only. Route handlers and server-side modules may use the database; Client Components may not import them.

The primary dependency direction is one-way:

`Algorithm -> SimulationTrace -> Playback Engine -> Renderer -> Animation`

The algorithm and trace layers are framework-independent. Playback is algorithm-agnostic. Renderers translate state into UI and Motion animates rendered transitions.

The database stores only authentication data, learning progress, and quiz history. Visualizer activity is transient and is not persisted event-by-event.

## Application directories

The planned structure is created on demand rather than populated with placeholder files:

```text
src/
  app/
  components/{ui,layout,learning}/
  content/
  features/{auth,progress,quiz,simulation}/
  visualizers/
  lib/
  generated/
```

Only directories with a current implementation are committed. Future code must follow the dependency and boundary rules above.

## Simulation core

The reusable Phase 5 core is exposed by `src/features/simulation/core/index.ts`.
It contains only typed contracts, invariant validation, and deterministic
playback state transitions. Timing, rendering, animation, and domain algorithms
remain outside the core.
