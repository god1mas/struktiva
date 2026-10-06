import { describe, expect, it } from "vitest";
import {
  codeLineId,
  getFinalFrame,
  getInitialFrame,
  simulationFrameId,
  validateSimulationTrace,
} from "..";
import {
  createSyntheticTrace,
  syntheticCode,
} from "./fixtures/synthetic-simulation";

describe("simulation trace validation", () => {
  it("accepts a valid trace with stable code references", () => {
    const trace = createSyntheticTrace();

    expect(validateSimulationTrace(trace, syntheticCode)).toBe(trace);
  });

  it("rejects a trace with zero frames", () => {
    const trace = createSyntheticTrace();

    expect(() =>
      validateSimulationTrace({ ...trace, frames: [] }, syntheticCode),
    ).toThrow("at least one frame");
  });

  it("rejects duplicate frame IDs", () => {
    const trace = createSyntheticTrace();
    const firstFrame = trace.frames[0];
    const secondFrame = trace.frames[1];

    expect(firstFrame).toBeDefined();
    expect(secondFrame).toBeDefined();

    expect(() =>
      validateSimulationTrace(
        {
          ...trace,
          frames: [
            firstFrame!,
            { ...secondFrame!, id: firstFrame!.id },
          ],
        },
        syntheticCode,
      ),
    ).toThrow("duplicate frame ID");
  });

  it("accepts valid active C++ line IDs", () => {
    const trace = createSyntheticTrace();

    expect(() => validateSimulationTrace(trace, syntheticCode)).not.toThrow();
    expect(trace.frames[0]?.activeCppLineIds).toEqual([
      codeLineId("cpp-initialize"),
    ]);
  });

  it("rejects unknown active C++ line IDs", () => {
    const trace = createSyntheticTrace();
    const frames = trace.frames.map((frame, index) =>
      index === 0
        ? { ...frame, activeCppLineIds: [codeLineId("cpp-unknown")] }
        : frame,
    );

    expect(() =>
      validateSimulationTrace({ ...trace, frames }, syntheticCode),
    ).toThrow("unknown C++ line ID");
  });

  it("accepts valid active pseudocode line IDs", () => {
    const trace = createSyntheticTrace();

    expect(() => validateSimulationTrace(trace, syntheticCode)).not.toThrow();
    expect(trace.frames[0]?.activePseudocodeLineIds).toEqual([
      codeLineId("pseudo-initialize"),
    ]);
  });

  it("rejects unknown active pseudocode line IDs", () => {
    const trace = createSyntheticTrace();
    const frames = trace.frames.map((frame, index) =>
      index === 0
        ? {
            ...frame,
            activePseudocodeLineIds: [codeLineId("pseudo-unknown")],
          }
        : frame,
    );

    expect(() =>
      validateSimulationTrace({ ...trace, frames }, syntheticCode),
    ).toThrow("unknown pseudocode line ID");
  });

  it("keeps duplicate values as distinct stable entities", () => {
    const trace = createSyntheticTrace({ values: [20, 20, 30] });
    const duplicateElements = trace.frames[0]?.state.filter(
      (element) => element.value === 20,
    );

    expect(duplicateElements).toHaveLength(2);
    expect(duplicateElements?.[0]?.id).not.toBe(duplicateElements?.[1]?.id);
  });

  it("produces deeply equal traces for identical input", () => {
    const input = { values: [20, 20, 30] };

    expect(createSyntheticTrace(input)).toEqual(createSyntheticTrace(input));
  });

  it("stores a complete logical snapshot in every frame", () => {
    const trace = createSyntheticTrace({ values: [20, 20, 30] });
    const expectedIds = trace.frames[0]?.state.map((element) => element.id);

    for (const frame of trace.frames) {
      expect(frame.state).toHaveLength(3);
      expect(frame.state.map((element) => element.id)).toEqual(expectedIds);
    }
  });

  it("derives initial and final frames without duplicate trace state", () => {
    const trace = createSyntheticTrace();

    expect(getInitialFrame(trace).id).toBe(simulationFrameId("initial"));
    expect(getFinalFrame(trace).id).toBe(simulationFrameId("complete"));
  });
});
