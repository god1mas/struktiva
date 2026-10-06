import {
  stableElementId,
  type SemanticVisualState,
  type StableElementId,
} from "../core";
import type {
  ArrayItem,
  ArrayPlacement,
  ArrayState,
  ArrayTransition,
  ArrayVisualState,
} from "./types";

export const ARRAY_MIN_VALUE = -99;
export const ARRAY_MAX_VALUE = 999;
export const ARRAY_MAX_ITEMS = 15;
export const DEFAULT_ARRAY_VALUES = [10, 20, 30, 40] as const;

export function arrayItemId(ordinal: number): StableElementId {
  return stableElementId(`array-item-${ordinal}`);
}

export function assertArrayValue(value: number): void {
  if (!Number.isInteger(value) || value < ARRAY_MIN_VALUE || value > ARRAY_MAX_VALUE) {
    throw new Error(
      `Nilai harus berupa bilangan bulat antara ${ARRAY_MIN_VALUE} dan ${ARRAY_MAX_VALUE}.`,
    );
  }
}

export function createArrayState(
  values: readonly number[] = DEFAULT_ARRAY_VALUES,
): ArrayState {
  if (values.length > ARRAY_MAX_ITEMS) {
    throw new Error(`Array dibatasi hingga ${ARRAY_MAX_ITEMS} elemen.`);
  }
  values.forEach(assertArrayValue);
  return {
    items: values.map((value, index) => ({ id: arrayItemId(index), value })),
    nextItemOrdinal: values.length,
    transition: null,
  };
}

export function arrayValues(state: ArrayState): readonly number[] {
  return state.items.map((item) => item.value);
}

export function defaultPlacements(state: ArrayState): readonly ArrayPlacement[] {
  return state.items.map((item, index) => ({ itemId: item.id, index }));
}

export function withTransition(
  state: ArrayState,
  transition: ArrayTransition,
): ArrayState {
  return { ...state, transition };
}

export function getRenderableItems(state: ArrayState): readonly ArrayItem[] {
  return state.transition === null
    ? state.items
    : [...state.items, ...state.transition.extraItems];
}

export function visualStates(
  state: ArrayState,
  overrides: ReadonlyMap<StableElementId, SemanticVisualState> = new Map(),
): ArrayVisualState {
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
