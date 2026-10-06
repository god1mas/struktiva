import { z } from "zod";
import {
  codeLineId,
  simulationFrameId,
  simulationTraceId,
  stableElementId,
  validateSimulationTrace,
  type AlgorithmDefinition,
  type ElementVisualState,
  type StableElementId,
} from "../..";

const syntheticInputSchema = z.object({
  values: z.array(z.number()).min(1),
});

export type SyntheticInput = z.infer<typeof syntheticInputSchema>;

export interface SyntheticElement {
  readonly id: StableElementId;
  readonly value: number;
}

export type SyntheticState = readonly SyntheticElement[];
export type SyntheticVisualState = readonly ElementVisualState[];

export const syntheticCode = {
  cpp: {
    language: "cpp",
    lines: [
      { id: codeLineId("cpp-initialize"), content: "initialize(values);" },
      { id: codeLineId("cpp-inspect"), content: "inspect(values);" },
      { id: codeLineId("cpp-complete"), content: "return values;" },
    ],
  },
  pseudocode: {
    language: "pseudocode",
    lines: [
      { id: codeLineId("pseudo-initialize"), content: "Initialize values" },
      { id: codeLineId("pseudo-inspect"), content: "Inspect first value" },
      { id: codeLineId("pseudo-complete"), content: "Finish sequence" },
    ],
  },
} as const;

function createElements(values: readonly number[]): SyntheticState {
  return values.map((value, index) => ({
    id: stableElementId(`fixture-element-${index}`),
    value,
  }));
}

function snapshot(elements: SyntheticState): SyntheticState {
  return elements.map((element) => ({ ...element }));
}

function visualSnapshot(
  elements: SyntheticState,
  activeIndex?: number,
): SyntheticVisualState {
  return elements.map((element, index) => ({
    elementId: element.id,
    state: index === activeIndex ? "active" : "normal",
  }));
}

export const syntheticAlgorithm = {
  key: "synthetic-sequence",
  domain: "simulation-test-fixture",
  title: "Synthetic deterministic sequence",
  inputSchema: syntheticInputSchema,
  code: syntheticCode,
  simulate(input) {
    const elements = createElements(input.values);
    const trace = {
      id: simulationTraceId("synthetic-sequence-run"),
      frames: [
        {
          id: simulationFrameId("initial"),
          title: "Initial state",
          explanation: "All fixture elements are visible.",
          state: snapshot(elements),
          visualState: visualSnapshot(elements),
          activeCppLineIds: [codeLineId("cpp-initialize")],
          activePseudocodeLineIds: [codeLineId("pseudo-initialize")],
        },
        {
          id: simulationFrameId("inspect-first"),
          title: "Inspect first element",
          explanation: "The first stable element is active.",
          state: snapshot(elements),
          visualState: visualSnapshot(elements, 0),
          activeCppLineIds: [codeLineId("cpp-inspect")],
          activePseudocodeLineIds: [codeLineId("pseudo-inspect")],
        },
        {
          id: simulationFrameId("complete"),
          title: "Completed state",
          explanation: "The deterministic fixture is complete.",
          state: snapshot(elements),
          visualState: visualSnapshot(elements),
          activeCppLineIds: [codeLineId("cpp-complete")],
          activePseudocodeLineIds: [codeLineId("pseudo-complete")],
        },
      ],
    } as const;

    return validateSimulationTrace(trace, syntheticCode);
  },
} satisfies AlgorithmDefinition<
  SyntheticInput,
  SyntheticState,
  SyntheticVisualState
>;

export function createSyntheticTrace(
  input: SyntheticInput = { values: [20, 20, 30] },
) {
  return syntheticAlgorithm.simulate(syntheticInputSchema.parse(input));
}
