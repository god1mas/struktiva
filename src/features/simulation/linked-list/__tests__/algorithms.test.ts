import { describe, expect, it } from "vitest";
import {
  createLinkedListState,
  finalState,
  getOrderedNodes,
  getSimulatedAddress,
  linkedListValues,
  simulateDeleteHead,
  simulateDeletePosition,
  simulateDeleteTail,
  simulateInsertHead,
  simulateInsertPosition,
  simulateInsertTail,
  simulateSearch,
  simulateTraversal,
} from "..";

describe("linked list state", () => {
  it("keeps duplicate values as nodes with distinct stable IDs", () => {
    const state = createLinkedListState([7, 7]);
    const nodes = getOrderedNodes(state);

    expect(nodes.map((node) => node.value)).toEqual([7, 7]);
    expect(nodes[0]?.id).not.toBe(nodes[1]?.id);
  });

  it("derives deterministic, distinct simulated addresses", () => {
    const nodes = getOrderedNodes(createLinkedListState([1, 2]));

    expect(getSimulatedAddress(nodes[0]!.id)).toBe("0xA100");
    expect(getSimulatedAddress(nodes[1]!.id)).toBe("0xA110");
  });

  it("rejects values outside the documented bounds", () => {
    expect(() => createLinkedListState([-100])).toThrow(/-99/);
    expect(() => createLinkedListState([1000])).toThrow(/999/);
  });
});

describe("traversal and search", () => {
  it("creates a deterministic traversal trace for every visited node", () => {
    const state = createLinkedListState([10, 20, 30]);
    const first = simulateTraversal({ state });
    const second = simulateTraversal({ state });

    expect(first).toEqual(second);
    expect(first.frames.some((frame) => frame.explanation.includes("20"))).toBe(true);
    expect(finalState(first)).toEqual(state);
  });

  it("handles traversal of an empty list", () => {
    const trace = simulateTraversal({ state: createLinkedListState([]) });

    expect(trace.frames).toHaveLength(2);
    expect(trace.frames[0]?.explanation).toMatch(/HEAD bernilai NULL/);
  });

  it("traverses a one-node list and reaches NULL", () => {
    const trace = simulateTraversal({ state: createLinkedListState([12]) });

    expect(trace.frames.some((frame) => frame.title === "Kunjungi node 0")).toBe(true);
    expect(trace.frames.at(-1)?.explanation).toContain("1 node");
  });

  it("visits duplicate values as separate nodes", () => {
    const state = createLinkedListState([5, 5, 5]);
    const trace = simulateTraversal({ state });
    const activeIds = trace.frames
      .filter((frame) => frame.title.startsWith("Kunjungi node"))
      .map((frame) => frame.visualState.find((entry) => entry.state === "active")?.elementId);

    expect(new Set(activeIds).size).toBe(3);
  });

  it("stops search at the first duplicate match", () => {
    const state = createLinkedListState([4, 8, 8]);
    const trace = simulateSearch({ state, value: 8 });
    const foundFrame = trace.frames.find((frame) => frame.title === "Nilai ditemukan");

    expect(foundFrame?.visualState.find((entry) => entry.state === "found")?.elementId).toBe(
      getOrderedNodes(state)[1]?.id,
    );
  });

  it.each([
    { target: 4, index: 0 },
    { target: 8, index: 1 },
    { target: 12, index: 2 },
  ])("finds $target at list index $index", ({ target, index }) => {
    const state = createLinkedListState([4, 8, 12]);
    const trace = simulateSearch({ state, value: target });
    const found = trace.frames.at(-1)?.visualState.find(
      (entry) => entry.state === "found",
    );

    expect(found?.elementId).toBe(getOrderedNodes(state)[index]?.id);
  });

  it("ends at NULL when search misses", () => {
    const trace = simulateSearch({ state: createLinkedListState([1, 2]), value: 9 });

    expect(trace.frames.at(-1)?.title).toBe("Target tidak ditemukan");
  });

  it("rejects a search target outside the value range", () => {
    expect(() =>
      simulateSearch({ state: createLinkedListState([1]), value: 1000 }),
    ).toThrow();
  });
});

describe("insert operations", () => {
  it("inserts at the head without changing existing node identities", () => {
    const state = createLinkedListState([10, 20]);
    const originalIds = getOrderedNodes(state).map((node) => node.id);
    const trace = simulateInsertHead({ state, value: 5 });
    const result = finalState(trace);

    expect(linkedListValues(result)).toEqual([5, 10, 20]);
    expect(getOrderedNodes(result).slice(1).map((node) => node.id)).toEqual(originalIds);
    expect(trace.frames.some((frame) => frame.state.temporaryNodeIds.length === 1)).toBe(true);
  });

  it("inserts a duplicate value at the head of an empty or populated list", () => {
    const emptyResult = finalState(
      simulateInsertHead({ state: createLinkedListState([]), value: 7 }),
    );
    const duplicateResult = finalState(
      simulateInsertHead({ state: createLinkedListState([7]), value: 7 }),
    );

    expect(linkedListValues(emptyResult)).toEqual([7]);
    expect(linkedListValues(duplicateResult)).toEqual([7, 7]);
    expect(getOrderedNodes(duplicateResult)[0]?.id).not.toBe(
      getOrderedNodes(duplicateResult)[1]?.id,
    );
  });

  it("inserts at the tail of a non-empty list", () => {
    const result = finalState(
      simulateInsertTail({ state: createLinkedListState([1, 2]), value: 3 }),
    );

    expect(linkedListValues(result)).toEqual([1, 2, 3]);
  });

  it("uses the new node as HEAD when inserting tail into an empty list", () => {
    const result = finalState(
      simulateInsertTail({ state: createLinkedListState([]), value: 3 }),
    );

    expect(linkedListValues(result)).toEqual([3]);
    expect(result.headId).toBe(getOrderedNodes(result)[0]?.id);
  });

  it.each([
    { position: 0, expected: [9, 1, 2] },
    { position: 1, expected: [1, 9, 2] },
    { position: 2, expected: [1, 2, 9] },
  ])("inserts at valid position $position", ({ position, expected }) => {
    const result = finalState(
      simulateInsertPosition({
        state: createLinkedListState([1, 2]),
        value: 9,
        position,
      }),
    );

    expect(linkedListValues(result)).toEqual(expected);
  });

  it("rejects an invalid insert position with actionable feedback", () => {
    expect(() =>
      simulateInsertPosition({
        state: createLinkedListState([1, 2]),
        value: 9,
        position: 3,
      }),
    ).toThrow("Posisi sisip harus berada di antara 0 dan 2");
  });

  it("rejects a negative insert position with actionable feedback", () => {
    expect(() =>
      simulateInsertPosition({
        state: createLinkedListState([1, 2]),
        value: 9,
        position: -1,
      }),
    ).toThrow("Posisi sisip harus berada di antara 0 dan 2");
  });

  it("rejects insertion when the ten-node limit is reached", () => {
    const full = createLinkedListState(Array.from({ length: 10 }, (_, index) => index));

    expect(() => simulateInsertHead({ state: full, value: 11 })).toThrow(/batas 10/);
    expect(() => simulateInsertTail({ state: full, value: 11 })).toThrow(/batas 10/);
    expect(() =>
      simulateInsertPosition({ state: full, value: 11, position: 5 }),
    ).toThrow(/batas 10/);
  });

  it("allows the tail insertion that reaches exactly ten nodes", () => {
    const state = createLinkedListState(Array.from({ length: 9 }, (_, index) => index));
    const result = finalState(simulateInsertTail({ state, value: 9 }));

    expect(getOrderedNodes(result)).toHaveLength(10);
  });
});

describe("delete operations", () => {
  it("deletes the head and preserves the remaining identities", () => {
    const state = createLinkedListState([1, 2, 3]);
    const remainingIds = getOrderedNodes(state).slice(1).map((node) => node.id);
    const result = finalState(simulateDeleteHead({ state }));

    expect(linkedListValues(result)).toEqual([2, 3]);
    expect(getOrderedNodes(result).map((node) => node.id)).toEqual(remainingIds);
  });

  it("deletes the only tail and produces an empty list", () => {
    const result = finalState(
      simulateDeleteTail({ state: createLinkedListState([1]) }),
    );

    expect(result.headId).toBeNull();
    expect(result.nodes).toHaveLength(0);
  });

  it("deletes the tail from a multi-node list", () => {
    const result = finalState(
      simulateDeleteTail({ state: createLinkedListState([1, 2, 3]) }),
    );

    expect(linkedListValues(result)).toEqual([1, 2]);
    expect(getOrderedNodes(result).at(-1)?.nextId).toBeNull();
  });

  it.each([
    { position: 0, expected: [2, 3] },
    { position: 1, expected: [1, 3] },
    { position: 2, expected: [1, 2] },
  ])("deletes valid position $position", ({ position, expected }) => {
    const result = finalState(
      simulateDeletePosition({
        state: createLinkedListState([1, 2, 3]),
        position,
      }),
    );

    expect(linkedListValues(result)).toEqual(expected);
  });

  it("rejects delete operations on an empty list", () => {
    const empty = createLinkedListState([]);

    expect(() => simulateDeleteHead({ state: empty })).toThrow(/kosong/);
    expect(() => simulateDeleteTail({ state: empty })).toThrow(/kosong/);
    expect(() => simulateDeletePosition({ state: empty, position: 0 })).toThrow(/kosong/);
  });

  it("rejects an invalid delete position", () => {
    expect(() =>
      simulateDeletePosition({ state: createLinkedListState([1, 2]), position: 2 }),
    ).toThrow("Posisi hapus harus berada di antara 0 dan 1");
  });

  it("rejects a negative delete position", () => {
    expect(() =>
      simulateDeletePosition({ state: createLinkedListState([1, 2]), position: -1 }),
    ).toThrow("Posisi hapus harus berada di antara 0 dan 1");
  });
});

describe("trace invariants", () => {
  it("does not mutate its input and emits unique frame IDs with known code IDs", () => {
    const state = createLinkedListState([10, 20, 30]);
    const before = JSON.stringify(state);
    const trace = simulateInsertPosition({ state, value: 15, position: 1 });
    const frameIds = trace.frames.map((frame) => frame.id);
    const cppIds = new Set(
      trace.frames.flatMap((frame) => frame.activeCppLineIds),
    );
    const pseudocodeIds = new Set(
      trace.frames.flatMap((frame) => frame.activePseudocodeLineIds),
    );

    expect(JSON.stringify(state)).toBe(before);
    expect(new Set(frameIds).size).toBe(frameIds.length);
    expect(cppIds.size).toBeGreaterThan(0);
    expect(pseudocodeIds.size).toBeGreaterThan(0);
  });
});
