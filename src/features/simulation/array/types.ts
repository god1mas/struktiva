import type { ElementVisualState, StableElementId } from "../core";

export interface ArrayItem {
  readonly id: StableElementId;
  readonly value: number;
}

export interface ArrayPlacement {
  readonly itemId: StableElementId;
  readonly index: number;
}

export interface ArrayTransition {
  readonly kind: "insert" | "delete";
  readonly placements: readonly ArrayPlacement[];
  readonly extraItems: readonly ArrayItem[];
}

export interface ArrayState {
  readonly items: readonly ArrayItem[];
  readonly nextItemOrdinal: number;
  readonly transition: ArrayTransition | null;
}

export type ArrayVisualState = readonly ElementVisualState[];
export type ArrayView = "structure" | "memory";
export type ArrayOperationKey = "access" | "update" | "traversal" | "insert" | "delete";

export interface StateInput {
  readonly state: ArrayState;
}

export interface IndexInput extends StateInput {
  readonly index: number;
}

export interface UpdateInput extends IndexInput {
  readonly value: number;
}

export type InsertInput = UpdateInput;
