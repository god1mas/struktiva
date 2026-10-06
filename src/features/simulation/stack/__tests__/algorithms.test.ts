import { describe, expect, it } from "vitest";
import {
  STACK_CAPACITY,
  createStackState,
  finalState,
  getStackSimulatedAddress,
  simulateIsEmpty,
  simulateIsFull,
  simulatePeek,
  simulatePop,
  simulatePush,
  stackComplexities,
  stackCode,
  stackValues,
  topIndex,
} from "..";

type StackTrace = ReturnType<typeof simulatePush>;

function expectUniqueFrames(trace: StackTrace) {
  const ids = trace.frames.map((frame) => frame.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(trace.frames.every((frame) => frame.activeCppLineIds.length > 0)).toBe(true);
  expect(trace.frames.every((frame) => frame.activePseudocodeLineIds.length > 0)).toBe(true);
}

describe("Stack state", () => {
  it("uses bottom-to-top order and derives TOP", () => {
    const state = createStackState();
    expect(stackValues(state)).toEqual([10, 20, 30]);
    expect(topIndex(state)).toBe(2);
    expect(topIndex(createStackState([]))).toBe(-1);
    expect(state.capacity).toBe(8);
  });

  it("supports duplicates with unique stable IDs", () => {
    const state = createStackState([20, 20, 20]);
    expect(new Set(state.items.map((item) => item.id)).size).toBe(3);
  });

  it("validates fixed capacity and value boundaries", () => {
    expect(() => createStackState(Array.from({ length: 9 }, () => 1))).toThrow("8 elemen");
    expect(() => createStackState([-100])).toThrow("-99 dan 999");
    expect(() => createStackState([1000])).toThrow("-99 dan 999");
    expect(() => createStackState([1.5])).toThrow("bilangan bulat");
  });
});

describe("Stack push", () => {
  it("adds an item at TOP and advances the stable ordinal", () => {
    const state = createStackState([10, 20]);
    const trace = simulatePush({ state, value: 20 });
    const result = finalState(trace);
    expect(stackValues(result)).toEqual([10, 20, 20]);
    expect(result.items.at(-1)?.id).toBe("stack-item-2");
    expect(result.nextItemOrdinal).toBe(3);
    expect(trace.frames[1]?.state.transition).toEqual({
      kind: "push",
      detachedItems: [{ id: "stack-item-2", value: 20 }],
    });
    expectUniqueFrames(trace);
  });

  it("allows the seventh index then rejects overflow at capacity", () => {
    const seven = createStackState([0, 1, 2, 3, 4, 5, 6]);
    const full = finalState(simulatePush({ state: seven, value: 7 }));
    expect(full.items).toHaveLength(STACK_CAPACITY);
    expect(topIndex(full)).toBe(7);
    expect(() => simulatePush({ state: full, value: 8 })).toThrow(
      "Stack penuh. Push tidak dapat dilakukan karena kapasitas 8 elemen sudah tercapai.",
    );
  });

  it.each([-100, 1000, 1.5])("rejects invalid value %s", (value) => {
    expect(() => simulatePush({ state: createStackState(), value })).toThrow(
      "Nilai harus berupa bilangan bulat antara -99 dan 999",
    );
  });
});

describe("Stack pop and peek", () => {
  it("pops only TOP, preserves survivor IDs, and exposes the removed transition", () => {
    const state = createStackState([10, 20, 30]);
    const ids = state.items.map((item) => item.id);
    const trace = simulatePop({ state });
    const result = finalState(trace);
    expect(stackValues(result)).toEqual([10, 20]);
    expect(result.items.map((item) => item.id)).toEqual(ids.slice(0, -1));
    expect(trace.frames[2]?.state.transition?.detachedItems[0]).toEqual(state.items[2]);
    expect(trace.frames.at(-1)?.explanation).toContain("30");
  });

  it("pops the sole item into an empty state with TOP -1", () => {
    const result = finalState(simulatePop({ state: createStackState([7]) }));
    expect(result.items).toEqual([]);
    expect(topIndex(result)).toBe(-1);
  });

  it("peeks without changing state", () => {
    const state = createStackState([10, 20, 30]);
    const trace = simulatePeek({ state });
    expect(finalState(trace)).toEqual(state);
    expect(trace.frames.at(-1)?.explanation).toContain("30");
  });

  it("rejects pop and peek underflow", () => {
    const empty = createStackState([]);
    expect(() => simulatePop({ state: empty })).toThrow(
      "Stack kosong. Tidak ada elemen TOP yang dapat diambil.",
    );
    expect(() => simulatePeek({ state: empty })).toThrow(
      "Stack kosong. Tidak ada elemen TOP yang dapat diambil.",
    );
  });
});

describe("Stack predicates and invariants", () => {
  it.each([
    { values: [], expectedEmpty: true, expectedFull: false },
    { values: [1], expectedEmpty: false, expectedFull: false },
    { values: [0, 1, 2, 3, 4, 5, 6, 7], expectedEmpty: false, expectedFull: true },
  ])("reports empty/full for $values", ({ values, expectedEmpty, expectedFull }) => {
    const state = createStackState(values);
    const emptyTrace = simulateIsEmpty({ state });
    const fullTrace = simulateIsFull({ state });
    expect(emptyTrace.frames.at(-1)?.title).toContain(String(expectedEmpty));
    expect(fullTrace.frames.at(-1)?.title).toContain(String(expectedFull));
    expect(finalState(emptyTrace)).toEqual(state);
    expect(finalState(fullTrace)).toEqual(state);
  });

  it("is pure and deterministic", () => {
    const state = createStackState([10, 20]);
    const before = structuredClone(state);
    const first = simulatePush({ state, value: 30 });
    const second = simulatePush({ state, value: 30 });
    expect(state).toEqual(before);
    expect(first).toEqual(second);
    expectUniqueFrames(first);
  });

  it("declares every operation O(1) in all cases", () => {
    for (const complexity of Object.values(stackComplexities)) {
      expect(complexity).toMatchObject({ best: "O(1)", average: "O(1)", worst: "O(1)" });
    }
  });

  it("uses a fixed Array in beginner C++ without dynamic containers", () => {
    for (const code of Object.values(stackCode)) {
      const source = code.cpp.lines.map((line) => line.content).join("\n");
      expect(source).toContain("int items[8]");
      expect(source).not.toMatch(/std::stack|std::vector|vector\s*</);
    }
  });

  it("maps consecutive slots to deterministic simulated addresses", () => {
    expect(getStackSimulatedAddress(0)).toBe("0xC100");
    expect(getStackSimulatedAddress(1)).toBe("0xC104");
    expect(getStackSimulatedAddress(7)).toBe("0xC11C");
    expect(() => getStackSimulatedAddress(-1)).toThrow("non-negatif");
  });
});
