import {
  stableElementId,
  type SemanticVisualState,
  type StableElementId,
} from "../core";
import type {
  LinkedListNode,
  LinkedListState,
  LinkedListVisualState,
} from "./types";

export const LINKED_LIST_MIN_VALUE = -99;
export const LINKED_LIST_MAX_VALUE = 999;
export const LINKED_LIST_MAX_NODES = 10;
export const DEFAULT_LINKED_LIST_VALUES = [10, 20, 30] as const;

export function nodeId(ordinal: number): StableElementId {
  return stableElementId(`node-${ordinal}`);
}

export function createLinkedListState(
  values: readonly number[] = DEFAULT_LINKED_LIST_VALUES,
): LinkedListState {
  assertValueList(values);

  const nodes = values.map<LinkedListNode>((value, index) => ({
    id: nodeId(index),
    value,
    nextId: index + 1 < values.length ? nodeId(index + 1) : null,
  }));

  return {
    headId: nodes[0]?.id ?? null,
    nodes,
    temporaryNodeIds: [],
    nextNodeOrdinal: nodes.length,
  };
}

export function assertLinkedListValue(value: number): void {
  if (!Number.isInteger(value)) {
    throw new Error("Nilai harus berupa bilangan bulat.");
  }

  if (value < LINKED_LIST_MIN_VALUE || value > LINKED_LIST_MAX_VALUE) {
    throw new Error(
      `Nilai harus berada di antara ${LINKED_LIST_MIN_VALUE} dan ${LINKED_LIST_MAX_VALUE}.`,
    );
  }
}

export function assertValueList(values: readonly number[]): void {
  if (values.length > LINKED_LIST_MAX_NODES) {
    throw new Error(`Linked list dibatasi hingga ${LINKED_LIST_MAX_NODES} node.`);
  }

  for (const value of values) {
    assertLinkedListValue(value);
  }
}

export function getNode(
  state: LinkedListState,
  id: StableElementId,
): LinkedListNode {
  const node = state.nodes.find((candidate) => candidate.id === id);

  if (!node) {
    throw new Error(`Node "${id}" tidak ditemukan.`);
  }

  return node;
}

export function getOrderedNodes(state: LinkedListState): readonly LinkedListNode[] {
  const ordered: LinkedListNode[] = [];
  const visited = new Set<StableElementId>();
  let currentId = state.headId;

  while (currentId !== null) {
    if (visited.has(currentId)) {
      throw new Error("Linked list mengandung siklus.");
    }

    visited.add(currentId);
    const current = getNode(state, currentId);
    ordered.push(current);
    currentId = current.nextId;
  }

  return ordered;
}

export function getDetachedNodes(state: LinkedListState): readonly LinkedListNode[] {
  const temporary = new Set(state.temporaryNodeIds);
  return state.nodes.filter((node) => temporary.has(node.id));
}

export function linkedListValues(state: LinkedListState): readonly number[] {
  return getOrderedNodes(state).map((node) => node.value);
}

export function updateNode(
  state: LinkedListState,
  id: StableElementId,
  update: (node: LinkedListNode) => LinkedListNode,
): LinkedListState {
  return {
    ...state,
    nodes: state.nodes.map((node) => (node.id === id ? update(node) : node)),
  };
}

export function removeNode(
  state: LinkedListState,
  id: StableElementId,
): LinkedListState {
  return {
    ...state,
    nodes: state.nodes.filter((node) => node.id !== id),
    temporaryNodeIds: state.temporaryNodeIds.filter(
      (temporaryId) => temporaryId !== id,
    ),
  };
}

export function createTemporaryNode(
  state: LinkedListState,
  value: number,
): { readonly state: LinkedListState; readonly id: StableElementId } {
  const id = nodeId(state.nextNodeOrdinal);
  const node: LinkedListNode = { id, value, nextId: null };

  return {
    id,
    state: {
      ...state,
      nodes: [...state.nodes, node],
      temporaryNodeIds: [...state.temporaryNodeIds, id],
      nextNodeOrdinal: state.nextNodeOrdinal + 1,
    },
  };
}

export function attachTemporaryNode(
  state: LinkedListState,
  id: StableElementId,
): LinkedListState {
  return {
    ...state,
    temporaryNodeIds: state.temporaryNodeIds.filter(
      (temporaryId) => temporaryId !== id,
    ),
  };
}

export function visualStates(
  state: LinkedListState,
  overrides: ReadonlyMap<StableElementId, SemanticVisualState> = new Map(),
): LinkedListVisualState {
  return state.nodes.map((node) => ({
    elementId: node.id,
    state: overrides.get(node.id) ?? "normal",
  }));
}

export function semanticOverrides(
  entries: readonly (readonly [StableElementId, SemanticVisualState])[],
): ReadonlyMap<StableElementId, SemanticVisualState> {
  return new Map(entries);
}
