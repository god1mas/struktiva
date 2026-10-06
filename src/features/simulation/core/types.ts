import type { ZodType } from "zod";
import type { SemanticVisualState } from "./constants";
import type { SynchronizedCode } from "./code";
import type { SimulationTrace } from "./trace";

declare const stableElementIdBrand: unique symbol;

export type StableElementId = string & {
  readonly [stableElementIdBrand]: "StableElementId";
};

export interface ElementVisualState<
  ElementId extends string = StableElementId,
> {
  readonly elementId: ElementId;
  readonly state: SemanticVisualState;
}

export interface AlgorithmDefinition<Input, State, VisualState> {
  readonly key: string;
  readonly domain: string;
  readonly title: string;
  readonly inputSchema: ZodType<Input>;
  readonly code: SynchronizedCode;
  readonly simulate: (input: Input) => SimulationTrace<State, VisualState>;
}

export function stableElementId(value: string): StableElementId {
  if (value.trim().length === 0) {
    throw new Error("Stable element ID must not be empty");
  }

  return value as StableElementId;
}
