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

## Reference module boundary

The Phase 6 singly linked list module lives in
`src/features/simulation/linked-list`. Its state model, validation, code
listings, and trace-producing algorithms are framework-independent and
deterministic. They do not import React, Next.js, Motion, timers, or database
code.

The algorithm-agnostic React timer adapter lives in
`src/features/simulation/react`. Shared playback, code, and explanation UI
lives in `src/features/simulation/components`. The linked list renderer maps
logical snapshots and semantic visual states to DOM and Motion transitions but
contains no operation or pointer-rewiring logic. This preserves the dependency
direction documented above.

The `/visualizer/linked-list` route remains a Server Component entry point and
introduces a narrow Client Component boundary for the interactive visualizer.
Visualizer sessions are transient; Phase 6 adds no database schema, migration,
or persistence behavior.

## Learning and quiz infrastructure

Phase 7 follows a separate one-way dependency path:

`Content Definition -> Pure Learning Logic -> Server Service -> Database Repository -> UI`

Module and lesson metadata plus canonical quiz definitions are source-controlled.
Pure progress derivation and quiz scoring do not import Next.js, Better Auth, or
Prisma. Server adapters validate the Better Auth session and bind testable
service factories to Prisma. Client payloads never select a user or score, and
the public quiz representation excludes correct answers and explanations until
the server grades a complete submission.

Progress percentages are derived rather than persisted. Database writes contain
only user progress and quiz history; static prompts, option labels, answer keys,
and explanations are not stored. Guests use the same learning UI without a
database identity or persistent history.
