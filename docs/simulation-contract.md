# Simulation Contract

These invariants apply to every future simulation:

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
