# Simulation Contract

The framework-independent core lives at `src/features/simulation/core`. Future
modules import its supported contracts and utilities from the directory's public
`index.ts` instead of reaching into internal files.

## Invariants

These rules apply to every simulation:

1. Simulation algorithms are pure.
2. The simulation core must not import React.
3. Algorithms never run animations.
4. Algorithms produce a `SimulationTrace`.
5. Every step contains a full logical-state snapshot.
6. Logical state and visual state remain separate.
7. Every element has a stable ID.
8. Duplicate values remain distinguishable.
9. Code synchronization uses stable line IDs, never line numbers.
10. Renderers contain no algorithm logic.
11. The playback engine is algorithm-agnostic.
12. Randomization happens outside simulation algorithms.
13. Identical input produces a deterministic trace.

The core also remains independent of Next.js, Motion, DOM/browser APIs,
databases, Prisma, and Better Auth.

## Concrete contracts

`AlgorithmDefinition<Input, State, VisualState>` supplies stable algorithm and
domain keys, a title, a Zod input schema, synchronized C++ and pseudocode
listings, and a pure `simulate(input)` function.

`SimulationTrace<State, VisualState>` contains a stable trace ID and an ordered,
readonly frame list. It must contain at least one frame with unique stable frame
IDs. The first frame is the initial visible state and the last is the completed
visible state; initial and final state are derived rather than duplicated.

Every `SimulationFrame` contains a title, explanation, complete logical-state
snapshot, separate visual state, and active C++ and pseudocode line IDs. Frame
data contains no React nodes, CSS classes, or colors.

Element IDs are stable strings independent of values, so equal values remain
distinct entities. ID helpers only validate caller-provided IDs and never use
randomness. Code listings contain stable string line IDs and displayed content;
line numbers and array positions are never synchronization keys.

Shared semantic visual states are `normal`, `active`, `selected`, `new`,
`compared`, `found`, `removed`, and `muted`. Renderers decide their appearance.

Trace validation rejects empty traces, duplicate frame IDs, duplicate listing
line IDs, and active line references that do not exist in the matching listing.

## Playback state machine

Playback state contains the readonly trace, current frame index, status, and
speed. Statuses are `idle`, `playing`, `paused`, and `completed`; supported
speeds are `0.5`, `1`, `1.5`, and `2`.

- Initial state points to frame zero with `idle` status.
- `next` moves one frame. It preserves `playing` between frames and becomes
  `completed` at the final frame; it never moves beyond the end.
- `previous` moves one frame back and becomes `idle` at frame zero or `paused`
  elsewhere; it never moves before the start.
- `play` becomes `playing` unless already at the final frame. It never restarts
  implicitly.
- `pause` changes only `playing` to `paused`.
- `restart` returns to frame zero with `idle` status and retains speed.
- `jump` accepts only integer indexes within the trace. Frame zero is `idle`,
  the final frame is `completed`, and intermediate frames are `paused`.
- `setSpeed` accepts only a supported speed and preserves all other state.

Playback performs no timing or scheduling. A future UI adapter decides when to
call `next`. Transitions create new playback state without mutating the trace,
frames, logical snapshots, or visual states.
