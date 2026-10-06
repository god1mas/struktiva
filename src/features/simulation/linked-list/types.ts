import type { ElementVisualState, StableElementId } from "../core";

export interface LinkedListNode {
  readonly id: StableElementId;
  readonly value: number;
  readonly nextId: StableElementId | null;
}

export interface LinkedListState {
  readonly headId: StableElementId | null;
  readonly nodes: readonly LinkedListNode[];
  readonly temporaryNodeIds: readonly StableElementId[];
  readonly nextNodeOrdinal: number;
}

export type LinkedListVisualState = readonly ElementVisualState[];

export type LinkedListView = "structure" | "memory";

export type LinkedListOperationKey =
  | "traversal"
  | "search"
  | "insert-head"
  | "insert-tail"
  | "insert-position"
  | "delete-head"
  | "delete-tail"
  | "delete-position";

export interface StateInput {
  readonly state: LinkedListState;
}

export interface ValueInput extends StateInput {
  readonly value: number;
}

export interface PositionInput extends StateInput {
  readonly position: number;
}

export interface ValuePositionInput extends ValueInput {
  readonly position: number;
}
