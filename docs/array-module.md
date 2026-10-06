# Array Learning Module

Phase 8 adds the Array learning module at `/visualizer/array`, `/learn/array`,
and `/learn/array/quiz`. It reuses the shared simulation, playback, code, quiz,
and progress infrastructure without introducing a database model or dependency.

## State and identity

The framework-independent domain lives in `src/features/simulation/array`.
`ArrayState.items` is the ordered logical Array. Every element has a stable,
deterministic ID such as `array-item-0`; its current index is derived from
order and is never used as identity. Equal values therefore remain distinct,
and update preserves the target ID.

Insert and delete frames may carry a transition with explicit element-to-index
placements. Insert holds its new element separately until placement. Delete
keeps the removed element available while surviving elements shift. These
snapshots allow the renderer to reconstruct gaps, detached elements, and every
movement without implementing algorithm logic.

Values are integers from -99 through 999. At most 15 active elements are
allowed. Indexes are zero-based. Access, update, and delete accept `0..length-1`;
insert accepts `0..length`.

## Operations and complexity

- Access calculates the requested position directly and is O(1).
- Update changes one value while preserving identity and is O(1).
- Traversal visits indexes from 0 through `size - 1` and is O(n).
- Insert shifts elements right-to-left. Appending can be O(1) when capacity is
  available, while general indexed insertion is O(n).
- Delete shifts surviving elements left. Removing the last element requires no
  shift; general indexed deletion is O(n).

Each trace contains full state, semantic visual state, Indonesian explanation,
and stable C++ and pseudocode line IDs. C++ listings are displayed only; no
user-provided or documented C++ is executed.

## Views and playback

Structure view emphasizes index, value, order, and semantic state. Memory view
derives deterministic conceptual addresses from `0xB100` with four-byte
spacing. These labels are explicitly **alamat simulasi**, not real JavaScript
or C++ process addresses.

The visualizer follows the same session model as Linked List. `currentArray` is
the committed base for the next operation, while `activeTrace` supplies the
visible playback frame. Reaching the completed frame commits the final Array.
Restart rewinds only the active trace. Reset restores `[10, 20, 30, 40]`, and
Clear creates an empty Array.

## Learning integration

The Array manifest contains 12 source-controlled lessons across Fundamentals,
Operations, Performance, and Final chapters. Practice points to the visualizer.
The canonical quiz contains 10 questions and uses the shared public serializer,
server grading endpoint, guest behavior, and authenticated attempt persistence.
Because progress enumerates the content registry, Array and Linked List receive
independent progress and quiz summaries without module-specific database code.
