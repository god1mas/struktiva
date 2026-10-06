import { describe, expect, it } from "vitest";
import {
  ARRAY_MAX_ITEMS,
  arrayValues,
  createArrayState,
  finalState,
  simulateAccess,
  simulateDelete,
  simulateInsert,
  simulateTraversal,
  simulateUpdate,
} from "..";

function expectUniqueFrames(trace: ReturnType<typeof simulateTraversal>) {
  const ids = trace.frames.map((frame) => frame.id);
  expect(new Set(ids).size).toBe(ids.length);
}

describe("Array access", () => {
  it.each([0, 1, 3])("accesses valid index %i directly", (index) => {
    const state = createArrayState();
    const trace = simulateAccess({ state, index });
    expect(finalState(trace)).toEqual(state);
    expect(trace.frames.at(-1)?.explanation).toContain(String(state.items[index]!.value));
    expect(trace.frames).toHaveLength(3);
  });

  it.each([-1, 4])("rejects invalid index %i", (index) => {
    expect(() => simulateAccess({ state: createArrayState(), index })).toThrow(
      "Index harus berada",
    );
  });

  it("rejects access on an empty Array", () => {
    expect(() => simulateAccess({ state: createArrayState([]), index: 0 })).toThrow(
      "Array kosong",
    );
  });
});

describe("Array update", () => {
  it.each([0, 1, 3])("updates index %i and preserves its stable ID", (index) => {
    const state = createArrayState([10, 20, 20, 40]);
    const originalId = state.items[index]!.id;
    const result = finalState(simulateUpdate({ state, index, value: 99 }));
    expect(result.items[index]).toEqual({ id: originalId, value: 99 });
    expect(result.items.filter((item) => item.value === 20)).toHaveLength(
      index === 1 || index === 2 ? 1 : 2,
    );
  });

  it("rejects invalid indexes and values outside the contract", () => {
    expect(() => simulateUpdate({ state: createArrayState(), index: 9, value: 1 })).toThrow(
      "Index harus berada",
    );
    expect(() => simulateUpdate({ state: createArrayState(), index: 0, value: -100 })).toThrow(
      "Nilai harus berupa bilangan bulat antara -99 dan 999",
    );
    expect(() => simulateUpdate({ state: createArrayState(), index: 0, value: 1.5 })).toThrow(
      "Nilai harus berupa bilangan bulat",
    );
  });
});

describe("Array traversal", () => {
  it("handles empty and one-element Arrays", () => {
    expect(simulateTraversal({ state: createArrayState([]) }).frames).toHaveLength(1);
    expect(simulateTraversal({ state: createArrayState([7]) }).frames).toHaveLength(3);
  });

  it("visits multiple duplicate values in deterministic index order", () => {
    const state = createArrayState([20, 20, 30]);
    const first = simulateTraversal({ state });
    const second = simulateTraversal({ state });
    expect(first).toEqual(second);
    expect(first.frames.map((frame) => frame.title)).toEqual([
      "Mulai traversal",
      "Kunjungi index 0",
      "Kunjungi index 1",
      "Kunjungi index 2",
      "Traversal selesai",
    ]);
    expect(new Set(state.items.map((item) => item.id)).size).toBe(3);
    expectUniqueFrames(first);
  });
});

describe("Array insert", () => {
  it.each([
    { values: [], index: 0, expected: [15] },
    { values: [10, 20, 30], index: 0, expected: [15, 10, 20, 30] },
    { values: [10, 20, 30], index: 1, expected: [10, 15, 20, 30] },
    { values: [10, 20, 30], index: 3, expected: [10, 20, 30, 15] },
  ])("inserts at index $index", ({ values, index, expected }) => {
    const result = finalState(simulateInsert({ state: createArrayState(values), index, value: 15 }));
    expect(arrayValues(result)).toEqual(expected);
  });

  it("models right-to-left shifts and preserves old IDs", () => {
    const state = createArrayState([10, 20, 20, 30]);
    const ids = state.items.map((item) => item.id);
    const trace = simulateInsert({ state, index: 1, value: 20 });
    const shiftTitles = trace.frames
      .map((frame) => frame.title)
      .filter((title) => title.startsWith("Geser"));
    expect(shiftTitles).toEqual([
      "Geser index 3 ke 4",
      "Geser index 2 ke 3",
      "Geser index 1 ke 2",
    ]);
    const result = finalState(trace);
    expect(result.items.filter((item) => item.value === 20)).toHaveLength(3);
    expect(result.items.filter((item) => ids.includes(item.id)).map((item) => item.id)).toEqual(ids);
    expect(result.items[1]!.id).not.toBe(ids[1]);
    expectUniqueFrames(trace);
  });

  it("allows 14 to 15 items and rejects insertion at capacity", () => {
    const fourteen = createArrayState(Array.from({ length: 14 }, (_, index) => index));
    expect(finalState(simulateInsert({ state: fourteen, index: 14, value: 99 })).items).toHaveLength(15);
    const full = createArrayState(Array.from({ length: ARRAY_MAX_ITEMS }, (_, index) => index));
    expect(() => simulateInsert({ state: full, index: 15, value: 99 })).toThrow(
      "batas 15 elemen",
    );
  });

  it.each([-1, 4])("rejects invalid insertion index %i", (index) => {
    expect(() => simulateInsert({ state: createArrayState([1, 2, 3]), index, value: 4 })).toThrow(
      "Index sisip harus berada",
    );
  });
});

describe("Array delete", () => {
  it.each([
    { values: [10, 20, 30], index: 0, expected: [20, 30] },
    { values: [10, 20, 30], index: 1, expected: [10, 30] },
    { values: [10, 20, 30], index: 2, expected: [10, 20] },
    { values: [10], index: 0, expected: [] },
  ])("deletes index $index", ({ values, index, expected }) => {
    expect(arrayValues(finalState(simulateDelete({ state: createArrayState(values), index })))).toEqual(expected);
  });

  it("models left shifts, skips fake shifts at the end, and preserves survivor IDs", () => {
    const state = createArrayState([10, 20, 30, 40]);
    const survivorIds = [state.items[0]!.id, state.items[2]!.id, state.items[3]!.id];
    const middleTrace = simulateDelete({ state, index: 1 });
    expect(middleTrace.frames.map((frame) => frame.title)).toContain("Geser index 2 ke 1");
    expect(middleTrace.frames.map((frame) => frame.title)).toContain("Geser index 3 ke 2");
    expect(finalState(middleTrace).items.map((item) => item.id)).toEqual(survivorIds);

    const lastTrace = simulateDelete({ state, index: 3 });
    expect(lastTrace.frames.some((frame) => frame.title.startsWith("Geser"))).toBe(false);
  });

  it("rejects empty and out-of-range deletion", () => {
    expect(() => simulateDelete({ state: createArrayState([]), index: 0 })).toThrow("Array kosong");
    expect(() => simulateDelete({ state: createArrayState(), index: -1 })).toThrow("Index harus berada");
    expect(() => simulateDelete({ state: createArrayState(), index: 4 })).toThrow("Index harus berada");
  });
});

describe("Array trace invariants", () => {
  it("does not mutate input and produces deterministic valid code references", () => {
    const state = createArrayState([10, 20, 30]);
    const before = structuredClone(state);
    const first = simulateInsert({ state, index: 1, value: 15 });
    const second = simulateInsert({ state, index: 1, value: 15 });
    expect(state).toEqual(before);
    expect(first).toEqual(second);
    expectUniqueFrames(first);
    expect(first.frames.every((frame) => frame.activeCppLineIds.length > 0)).toBe(true);
    expect(first.frames.every((frame) => frame.activePseudocodeLineIds.length > 0)).toBe(true);
  });
});
