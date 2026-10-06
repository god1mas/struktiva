import type { ZodType } from "zod";
import {
  getFinalFrame,
  simulationFrameId,
  simulationTraceId,
  validateSimulationTrace,
  type AlgorithmDefinition,
  type SemanticVisualState,
  type SimulationFrame,
  type SimulationTrace,
  type StableElementId,
} from "../core";
import { activeLines, stackCode } from "./code-listings";
import {
  semanticOverrides,
  stackItemId,
  topIndex,
  topItem,
  visualStates,
} from "./state";
import type {
  StackItem,
  StackOperationKey,
  StackState,
  StackVisualState,
  StateInput,
  ValueInput,
} from "./types";
import {
  assertCanPush,
  assertHasTop,
  assertValue,
  parseInput,
  stateInputSchema,
  valueInputSchema,
} from "./validation";

type Frame = SimulationFrame<StackState, StackVisualState>;
type VisualEntry = readonly [StableElementId, SemanticVisualState];

function frame(
  operation: StackOperationKey,
  index: number,
  title: string,
  explanation: string,
  state: StackState,
  lineKey: string,
  visual: readonly VisualEntry[] = [],
): Frame {
  return {
    id: simulationFrameId(`stack-${operation}-${index}`),
    title,
    explanation,
    state,
    visualState: visualStates(state, semanticOverrides(visual)),
    ...activeLines(operation, lineKey),
  };
}

function fingerprint(state: StackState): string {
  return state.items.map((item) => `${item.id}:${item.value}`).join(",") || "empty";
}

function trace(
  operation: StackOperationKey,
  inputKey: string,
  frames: readonly Frame[],
): SimulationTrace<StackState, StackVisualState> {
  return validateSimulationTrace(
    { id: simulationTraceId(`stack-${operation}-${inputKey}`), frames },
    stackCode[operation],
  );
}

function definition<Input>(
  key: StackOperationKey,
  title: string,
  inputSchema: ZodType<Input>,
  simulate: (input: Input) => SimulationTrace<StackState, StackVisualState>,
): AlgorithmDefinition<Input, StackState, StackVisualState> {
  return { key, domain: "stack", title, inputSchema, code: stackCode[key], simulate };
}

export function simulatePush(rawInput: ValueInput) {
  const { state, value } = parseInput(
    valueInputSchema as unknown as ZodType<ValueInput>,
    rawInput,
  );
  assertCanPush(state);
  assertValue(value);
  const fresh: StackItem = { id: stackItemId(state.nextItemOrdinal), value };
  const detached: StackState = {
    ...state,
    transition: { kind: "push", detachedItems: [fresh] },
  };
  const completed: StackState = {
    ...state,
    items: [...state.items, fresh],
    nextItemOrdinal: state.nextItemOrdinal + 1,
    transition: null,
  };
  return trace("push", `${fingerprint(state)}:${value}`, [
    frame(
      "push", 0, "Periksa kapasitas",
      `Ukuran ${state.items.length} masih di bawah kapasitas ${state.capacity}.`,
      state, "check",
    ),
    frame(
      "push", 1, "Siapkan elemen",
      `Nilai ${value} mendapat ID stabil ${fresh.id} sebelum masuk ke Stack.`,
      detached, "move", [[fresh.id, "new"]],
    ),
    frame(
      "push", 2, "Tempatkan di TOP",
      `Elemen ${value} ditempatkan pada slot ${state.items.length}; TOP bergerak ke ${state.items.length}.`,
      completed, "write", [[fresh.id, "active"]],
    ),
    frame(
      "push", 3, "Push selesai",
      `Nilai ${value} sekarang menjadi TOP. Ukuran Stack adalah ${completed.items.length}.`,
      completed, "done", [[fresh.id, "found"]],
    ),
  ]);
}

export function simulatePop(rawInput: StateInput) {
  const { state } = parseInput(
    stateInputSchema as unknown as ZodType<StateInput>,
    rawInput,
  );
  assertHasTop(state);
  const target = topItem(state)!;
  const survivors = state.items.slice(0, -1);
  const transitioning: StackState = {
    ...state,
    items: survivors,
    transition: { kind: "pop", detachedItems: [target] },
  };
  const completed: StackState = { ...state, items: survivors, transition: null };
  return trace("pop", fingerprint(state), [
    frame(
      "pop", 0, "Periksa TOP",
      `TOP berada pada index ${topIndex(state)} dan Stack tidak kosong.`,
      state, "check", [[target.id, "selected"]],
    ),
    frame(
      "pop", 1, "Baca nilai TOP",
      `Nilai ${target.value} disimpan sebelum elemen dilepas.`,
      state, "read", [[target.id, "active"]],
    ),
    frame(
      "pop", 2, "Lepaskan TOP",
      `Elemen ${target.value} keluar; TOP bergerak ke ${topIndex(completed)}.`,
      transitioning, "move", [[target.id, "removed"]],
    ),
    frame(
      "pop", 3, "Pop selesai",
      `Nilai yang dikembalikan adalah ${target.value}. Ukuran Stack menjadi ${completed.items.length}.`,
      completed, "done",
    ),
  ]);
}

export function simulatePeek(rawInput: StateInput) {
  const { state } = parseInput(
    stateInputSchema as unknown as ZodType<StateInput>,
    rawInput,
  );
  assertHasTop(state);
  const target = topItem(state)!;
  return trace("peek", fingerprint(state), [
    frame(
      "peek", 0, "Periksa TOP",
      `TOP berada pada index ${topIndex(state)} dan Stack tidak kosong.`,
      state, "check", [[target.id, "selected"]],
    ),
    frame(
      "peek", 1, "Baca nilai TOP",
      `Nilai ${target.value} dibaca langsung tanpa menghapus elemen.`,
      state, "read", [[target.id, "active"]],
    ),
    frame(
      "peek", 2, "Peek selesai",
      `Nilai TOP adalah ${target.value}; keadaan Stack tidak berubah.`,
      state, "done", [[target.id, "found"]],
    ),
  ]);
}

export function simulateIsEmpty(rawInput: StateInput) {
  const { state } = parseInput(
    stateInputSchema as unknown as ZodType<StateInput>,
    rawInput,
  );
  const result = state.items.length === 0;
  return trace("is-empty", fingerprint(state), [
    frame(
      "is-empty", 0, "Periksa TOP",
      `TOP = ${topIndex(state)} dibandingkan dengan -1.`,
      state, "check",
    ),
    frame(
      "is-empty", 1, `isEmpty menghasilkan ${String(result)}`,
      result ? "TOP = -1, jadi Stack kosong." : "TOP bukan -1, jadi Stack berisi elemen.",
      state, "done",
    ),
  ]);
}

export function simulateIsFull(rawInput: StateInput) {
  const { state } = parseInput(
    stateInputSchema as unknown as ZodType<StateInput>,
    rawInput,
  );
  const result = state.items.length === state.capacity;
  return trace("is-full", fingerprint(state), [
    frame(
      "is-full", 0, "Periksa kapasitas",
      `Ukuran ${state.items.length} dibandingkan dengan kapasitas ${state.capacity}.`,
      state, "check",
    ),
    frame(
      "is-full", 1, `isFull menghasilkan ${String(result)}`,
      result ? "Ukuran sama dengan kapasitas, jadi Stack penuh." : "Masih ada slot kosong pada Stack.",
      state, "done",
    ),
  ]);
}

export const stackAlgorithms = {
  push: definition(
    "push", "Push", valueInputSchema as unknown as ZodType<ValueInput>, simulatePush,
  ),
  pop: definition(
    "pop", "Pop", stateInputSchema as unknown as ZodType<StateInput>, simulatePop,
  ),
  peek: definition(
    "peek", "Peek", stateInputSchema as unknown as ZodType<StateInput>, simulatePeek,
  ),
  "is-empty": definition(
    "is-empty", "isEmpty", stateInputSchema as unknown as ZodType<StateInput>, simulateIsEmpty,
  ),
  "is-full": definition(
    "is-full", "isFull", stateInputSchema as unknown as ZodType<StateInput>, simulateIsFull,
  ),
} as const;

export function finalState(
  simulationTrace: SimulationTrace<StackState, StackVisualState>,
): StackState {
  return getFinalFrame(simulationTrace).state;
}
