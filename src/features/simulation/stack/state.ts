import {
  stableElementId,
  type SemanticVisualState,
  type StableElementId,
} from "../core";
import type { StackItem, StackState, StackVisualState } from "./types";

export const STACK_CAPACITY = 8;
export const STACK_MIN_VALUE = -99;
export const STACK_MAX_VALUE = 999;
export const DEFAULT_STACK_VALUES = [10, 20, 30] as const;

export function stackItemId(ordinal: number): StableElementId {
  return stableElementId(`stack-item-${ordinal}`);
}

export function assertStackValue(value: number): void {
  if (!Number.isInteger(value) || value < STACK_MIN_VALUE || value > STACK_MAX_VALUE) {
    throw new Error(
      `Nilai harus berupa bilangan bulat antara ${STACK_MIN_VALUE} dan ${STACK_MAX_VALUE}.`,
    );
  }
}

export function createStackState(
  values: readonly number[] = DEFAULT_STACK_VALUES,
): StackState {
  if (values.length > STACK_CAPACITY) {
    throw new Error(`Stack dibatasi hingga ${STACK_CAPACITY} elemen.`);
  }
  values.forEach(assertStackValue);
  return {
    items: values.map((value, index) => ({ id: stackItemId(index), value })),
    nextItemOrdinal: values.length,
    capacity: STACK_CAPACITY,
    transition: null,
  };
}

export function stackValues(state: StackState): readonly number[] {
  return state.items.map((item) => item.value);
}

export function topIndex(state: StackState): number {
  return state.items.length - 1;
}

export function topItem(state: StackState): StackItem | undefined {
  return state.items.at(-1);
}

export function getRenderableItems(state: StackState): readonly StackItem[] {
  return state.transition === null
    ? state.items
    : [...state.items, ...state.transition.detachedItems];
}

export function visualStates(
  state: StackState,
  overrides: ReadonlyMap<StableElementId, SemanticVisualState> = new Map(),
): StackVisualState {
  return getRenderableItems(state).map((item) => ({
    elementId: item.id,
    state: overrides.get(item.id) ?? "normal",
  }));
}

export function semanticOverrides(
  entries: readonly (readonly [StableElementId, SemanticVisualState])[],
): ReadonlyMap<StableElementId, SemanticVisualState> {
  return new Map(entries);
}
