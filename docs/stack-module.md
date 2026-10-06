# Stack Module

## Domain contract

The Stack is backed by a conceptual fixed Array with capacity 8. Logical items
are stored bottom-to-top, so slot 0 is BOTTOM and the final active slot is TOP.
TOP is derived as `items.length - 1`; an empty Stack therefore displays
`TOP = -1`. Integer values must be between -99 and 999. Stable item IDs are
allocated monotonically and do not depend on value or current position, so
duplicate values are safe.

The state and all simulations in `src/features/simulation/stack` are pure and
deterministic. They do not import React, Motion, timers, or persistence code.

## Operations and traces

- Push checks capacity, creates a detached incoming item, places it at the new
  TOP, and completes. Pushing at size 8 reports overflow.
- Pop identifies and reads TOP, keeps the removed item detached in the trace
  while TOP moves, then returns its value. Popping an empty Stack reports
  underflow.
- Peek reads TOP without changing the logical state. Peeking an empty Stack
  reports underflow.
- isEmpty compares TOP with -1 without changing state.
- isFull compares size with capacity without changing state.

Every operation has best, average, and worst complexity O(1). C++ examples use
a fixed integer Array and integer TOP; they deliberately avoid `std::stack`,
`std::vector`, or other STL containers. Pseudocode and C++ lines use stable IDs
that are validated against every simulation frame.

## Rendering and memory model

The renderer consumes only trace snapshots and semantic visual states. It lays
items out vertically, labels TOP and BOTTOM, and displays size and capacity.
Structure view emphasizes LIFO order. Memory view derives a simulated address
for slot `i` using `0xC100 + i * 4`; these values are teaching aids, not process
memory addresses. Incoming Push and outgoing Pop items are rendered from the
explicit transition field in Stack state.

The `/visualizer/stack` route is a Server Component entry point with a narrow
client boundary for controls, playback, and animation. Completed mutating
traces commit their final state; read-only traces retain the same state. Reset
restores `[10, 20, 30]`, while clear creates an empty Stack.

## Learning integration

The source-controlled Stack manifest contains exactly 11 lessons across
Fundamentals, Operations, Performance, and Final chapters. Its quiz contains 10
Indonesian multiple-choice questions with four options each. Both use the same
generic registry, secure server-side grading, guest behavior, authenticated
progress, and retake history as the existing modules. No database schema or
migration is introduced.
