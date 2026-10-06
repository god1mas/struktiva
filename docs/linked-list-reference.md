# Singly Linked List Reference Visualizer

The Phase 6 reference module is available at `/visualizer/linked-list`. It is a
complete vertical slice over the shared simulation core and is the reference
shape for later data-structure modules.

## Learning model

The visible structure starts as `10 -> 20 -> 30 -> NULL`. Each node stores a
stable identity, an integer value, and a `nextId`; `headId` identifies the first
node. Values may repeat without collapsing node identity. Values are limited to
integers from -99 through 999, the list is limited to 10 nodes, and positions
are zero-based.

The module supports traversal, search, insert at head/tail/position, and delete
at head/tail/position. Insert and delete traces deliberately expose temporary
or detached nodes so pointer changes can be understood before the final state
is committed. Completing an operation makes its final list the input for the
next operation. Restart rewinds only the current trace; **Reset 10→20→30** is a
separate action.

## Trace and code synchronization

Algorithms in `src/features/simulation/linked-list` are pure and deterministic.
They accept a complete logical state and return a validated `SimulationTrace`.
Every frame contains a full state snapshot, semantic element states, an
Indonesian explanation, and stable IDs for the active C++ and pseudocode lines.
Line IDs—not displayed line numbers—provide synchronization.

The React playback adapter owns the timer. The algorithms, trace data, and
renderer do not schedule work. The renderer maps semantic states to accessible
labels and visual treatments; it does not decide algorithm steps.

## Structure and memory views

Structure view renders each node as `[ value | next ]`, with HEAD, directional
arrows, and NULL. Memory view derives deterministic labels starting at
`0xA100`, spaced by `0x10` per node ordinal. These labels are explicitly called
**alamat simulasi** and are never presented as real process addresses.

The canvas scrolls locally on narrow screens. Motion is limited to meaningful
state transitions, and reduced-motion preference removes positional animation
without removing steps or explanations.

## Verification coverage

Vitest covers domain invariants, deterministic traces, edge cases for every
operation, timer behavior, code tabs, renderer output, and validation feedback.
Playwright covers the complete insert-head and search learning flow, restart,
invalid position feedback, code highlighting, desktop behavior, and a 390×844
viewport without page-level horizontal overflow or browser errors.
