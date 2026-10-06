import type { ElementVisualState, StableElementId } from "../core";

export interface StackItem {
  readonly id: StableElementId;
  readonly value: number;
}

export interface StackTransition {
  readonly kind: "push" | "pop";
  readonly detachedItems: readonly StackItem[];
}

export interface StackState {
  readonly items: readonly StackItem[];
  readonly nextItemOrdinal: number;
  readonly capacity: number;
  readonly transition: StackTransition | null;
}

export type StackVisualState = readonly ElementVisualState[];
export type StackView = "structure" | "memory";
export type StackOperationKey = "push" | "pop" | "peek" | "is-empty" | "is-full";

export interface StateInput {
  readonly state: StackState;
}

export interface ValueInput extends StateInput {
  readonly value: number;
}
