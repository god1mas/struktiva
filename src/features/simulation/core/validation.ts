import type { CodeLineId, CodeListing, SynchronizedCode } from "./code";
import type { SimulationTrace } from "./trace";

export class SimulationInvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SimulationInvariantError";
  }
}

function collectCodeLineIds(
  listing: CodeListing,
  label: string,
): ReadonlySet<CodeLineId> {
  const ids = new Set<CodeLineId>();

  for (const line of listing.lines) {
    if (line.id.trim().length === 0) {
      throw new SimulationInvariantError(`${label} contains an empty line ID`);
    }

    if (ids.has(line.id)) {
      throw new SimulationInvariantError(
        `${label} contains duplicate line ID "${line.id}"`,
      );
    }

    ids.add(line.id);
  }

  return ids;
}

function assertKnownLineIds(
  activeIds: readonly CodeLineId[],
  knownIds: ReadonlySet<CodeLineId>,
  language: string,
  frameId: string,
) {
  for (const activeId of activeIds) {
    if (!knownIds.has(activeId)) {
      throw new SimulationInvariantError(
        `Frame "${frameId}" references unknown ${language} line ID "${activeId}"`,
      );
    }
  }
}

export function validateSimulationTrace<State, VisualState>(
  trace: SimulationTrace<State, VisualState>,
  code: SynchronizedCode,
): SimulationTrace<State, VisualState> {
  if (trace.frames.length === 0) {
    throw new SimulationInvariantError(
      "Simulation trace must contain at least one frame",
    );
  }

  const cppLineIds = collectCodeLineIds(code.cpp, "C++ listing");
  const pseudocodeLineIds = collectCodeLineIds(
    code.pseudocode,
    "Pseudocode listing",
  );
  const frameIds = new Set<string>();

  for (const frame of trace.frames) {
    if (frame.id.trim().length === 0) {
      throw new SimulationInvariantError(
        "Simulation trace contains an empty frame ID",
      );
    }

    if (frameIds.has(frame.id)) {
      throw new SimulationInvariantError(
        `Simulation trace contains duplicate frame ID "${frame.id}"`,
      );
    }

    frameIds.add(frame.id);
    assertKnownLineIds(
      frame.activeCppLineIds,
      cppLineIds,
      "C++",
      frame.id,
    );
    assertKnownLineIds(
      frame.activePseudocodeLineIds,
      pseudocodeLineIds,
      "pseudocode",
      frame.id,
    );
  }

  return trace;
}
