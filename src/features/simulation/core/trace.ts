import type { CodeLineId } from "./code";

declare const simulationFrameIdBrand: unique symbol;
declare const simulationTraceIdBrand: unique symbol;

export type SimulationFrameId = string & {
  readonly [simulationFrameIdBrand]: "SimulationFrameId";
};

export type SimulationTraceId = string & {
  readonly [simulationTraceIdBrand]: "SimulationTraceId";
};

export interface SimulationFrame<State, VisualState> {
  readonly id: SimulationFrameId;
  readonly title: string;
  readonly explanation: string;
  readonly state: State;
  readonly visualState: VisualState;
  readonly activeCppLineIds: readonly CodeLineId[];
  readonly activePseudocodeLineIds: readonly CodeLineId[];
}

export interface SimulationTrace<State, VisualState> {
  readonly id: SimulationTraceId;
  readonly frames: readonly SimulationFrame<State, VisualState>[];
}

export function simulationFrameId(value: string): SimulationFrameId {
  if (value.trim().length === 0) {
    throw new Error("Simulation frame ID must not be empty");
  }

  return value as SimulationFrameId;
}

export function simulationTraceId(value: string): SimulationTraceId {
  if (value.trim().length === 0) {
    throw new Error("Simulation trace ID must not be empty");
  }

  return value as SimulationTraceId;
}

export function getInitialFrame<State, VisualState>(
  trace: SimulationTrace<State, VisualState>,
): SimulationFrame<State, VisualState> {
  const frame = trace.frames[0];

  if (!frame) {
    throw new Error("Simulation trace must contain at least one frame");
  }

  return frame;
}

export function getFinalFrame<State, VisualState>(
  trace: SimulationTrace<State, VisualState>,
): SimulationFrame<State, VisualState> {
  const frame = trace.frames.at(-1);

  if (!frame) {
    throw new Error("Simulation trace must contain at least one frame");
  }

  return frame;
}
