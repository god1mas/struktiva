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
import { activeLines, arrayCode } from "./code-listings";
import {
  arrayItemId,
  defaultPlacements,
  semanticOverrides,
  visualStates,
  withTransition,
} from "./state";
import type {
  ArrayItem,
  ArrayOperationKey,
  ArrayPlacement,
  ArrayState,
  ArrayVisualState,
  IndexInput,
  InsertInput,
  StateInput,
  UpdateInput,
} from "./types";
import {
  assertCanInsert,
  assertExistingIndex,
  assertInsertIndex,
  assertValue,
  indexInputSchema,
  insertInputSchema,
  parseInput,
  stateInputSchema,
  updateInputSchema,
} from "./validation";

type Frame = SimulationFrame<ArrayState, ArrayVisualState>;
type VisualEntry = readonly [StableElementId, SemanticVisualState];

function frame(
  operation: ArrayOperationKey,
  index: number,
  title: string,
  explanation: string,
  state: ArrayState,
  lineKey: string,
  visual: readonly VisualEntry[] = [],
): Frame {
  return {
    id: simulationFrameId(`array-${operation}-${index}`),
    title,
    explanation,
    state,
    visualState: visualStates(state, semanticOverrides(visual)),
    ...activeLines(operation, lineKey),
  };
}

function stateFingerprint(state: ArrayState): string {
  return state.items.map((item) => `${item.id}:${item.value}`).join(",") || "empty";
}

function trace(
  operation: ArrayOperationKey,
  inputKey: string,
  frames: readonly Frame[],
): SimulationTrace<ArrayState, ArrayVisualState> {
  return validateSimulationTrace(
    {
      id: simulationTraceId(`array-${operation}-${inputKey}`),
      frames,
    },
    arrayCode[operation],
  );
}

function definition<Input>(
  key: ArrayOperationKey,
  title: string,
  inputSchema: ZodType<Input>,
  simulate: (input: Input) => SimulationTrace<ArrayState, ArrayVisualState>,
): AlgorithmDefinition<Input, ArrayState, ArrayVisualState> {
  return { key, domain: "array", title, inputSchema, code: arrayCode[key], simulate };
}

export function simulateAccess(rawInput: IndexInput) {
  const { state, index } = parseInput(
    indexInputSchema as unknown as ZodType<IndexInput>,
    rawInput,
  );
  assertExistingIndex(state, index);
  const target = state.items[index]!;
  return trace("access", `${stateFingerprint(state)}:${index}`, [
    frame(
      "access",
      0,
      "Identifikasi index",
      `Index ${index} menentukan posisi elemen secara langsung (zero-based).`,
      state,
      "locate",
      [[target.id, "selected"]],
    ),
    frame(
      "access",
      1,
      "Akses elemen",
      `Array langsung mengakses elemen pada index ${index}; traversal tidak diperlukan.`,
      state,
      "locate",
      [[target.id, "active"]],
    ),
    frame(
      "access",
      2,
      "Nilai ditemukan",
      `Hasil akses arr[${index}] adalah ${target.value}. Kompleksitas O(1).`,
      state,
      "return",
      [[target.id, "found"]],
    ),
  ]);
}

export function simulateUpdate(rawInput: UpdateInput) {
  const { state, index, value } = parseInput(
    updateInputSchema as unknown as ZodType<UpdateInput>,
    rawInput,
  );
  assertExistingIndex(state, index);
  assertValue(value);
  const target = state.items[index]!;
  const updatedState: ArrayState = {
    ...state,
    items: state.items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, value } : item,
    ),
    transition: null,
  };
  return trace("update", `${stateFingerprint(state)}:${index}:${value}`, [
    frame(
      "update",
      0,
      "Pilih elemen",
      `Elemen pada index ${index} memiliki nilai ${target.value}.`,
      state,
      "locate",
      [[target.id, "selected"]],
    ),
    frame(
      "update",
      1,
      "Perbarui nilai",
      `Nilai diubah dari ${target.value} menjadi ${value}; ID elemen tetap ${target.id}.`,
      updatedState,
      "assign",
      [[target.id, "active"]],
    ),
    frame(
      "update",
      2,
      "Update selesai",
      `arr[${index}] sekarang bernilai ${value}. Kompleksitas O(1).`,
      updatedState,
      "done",
      [[target.id, "found"]],
    ),
  ]);
}

export function simulateTraversal(rawInput: StateInput) {
  const { state } = parseInput(
    stateInputSchema as unknown as ZodType<StateInput>,
    rawInput,
  );
  if (state.items.length === 0) {
    return trace("traversal", "empty", [
      frame(
        "traversal",
        0,
        "Array kosong",
        "Tidak ada elemen yang dapat dikunjungi. Traversal selesai tanpa iterasi.",
        state,
        "done",
      ),
    ]);
  }

  const frames: Frame[] = [
    frame(
      "traversal",
      0,
      "Mulai traversal",
      `Traversal dimulai dari index 0 dan akan mengunjungi ${state.items.length} elemen.`,
      state,
      "start",
    ),
  ];
  state.items.forEach((item, index) => {
    const visual: VisualEntry[] = state.items.map((candidate, candidateIndex) => [
      candidate.id,
      candidateIndex < index ? "muted" : candidateIndex === index ? "active" : "normal",
    ]);
    frames.push(
      frame(
        "traversal",
        frames.length,
        `Kunjungi index ${index}`,
        `i = ${index}; nilai arr[${index}] adalah ${item.value}.`,
        state,
        "visit",
        visual,
      ),
    );
  });
  frames.push(
    frame(
      "traversal",
      frames.length,
      "Traversal selesai",
      `Semua ${state.items.length} elemen telah dikunjungi. Kompleksitas O(n).`,
      state,
      "done",
      state.items.map((item) => [item.id, "muted"] as const),
    ),
  );
  return trace("traversal", stateFingerprint(state), frames);
}

function movePlacement(
  placements: readonly ArrayPlacement[],
  itemId: StableElementId,
  index: number,
): readonly ArrayPlacement[] {
  return placements.map((placement) =>
    placement.itemId === itemId ? { ...placement, index } : placement,
  );
}

export function simulateInsert(rawInput: InsertInput) {
  const { state, index, value } = parseInput(
    insertInputSchema as unknown as ZodType<InsertInput>,
    rawInput,
  );
  assertCanInsert(state);
  assertInsertIndex(state, index);
  assertValue(value);

  const fresh: ArrayItem = { id: arrayItemId(state.nextItemOrdinal), value };
  let placements = defaultPlacements(state);
  let transitionState = withTransition(state, {
    kind: "insert",
    placements,
    extraItems: [fresh],
  });
  const frames: Frame[] = [
    frame(
      "insert",
      0,
      "Buat ruang",
      `Siapkan slot pada index ${index}; pergeseran dilakukan dari kanan ke kiri.`,
      state,
      "space",
    ),
    frame(
      "insert",
      1,
      "Siapkan elemen baru",
      `Elemen baru ${value} mendapat ID stabil ${fresh.id} dan belum ditempatkan.`,
      transitionState,
      "space",
      [[fresh.id, "new"]],
    ),
  ];

  for (let sourceIndex = state.items.length - 1; sourceIndex >= index; sourceIndex -= 1) {
    const shifted = state.items[sourceIndex]!;
    placements = movePlacement(placements, shifted.id, sourceIndex + 1);
    transitionState = withTransition(state, {
      kind: "insert",
      placements,
      extraItems: [fresh],
    });
    frames.push(
      frame(
        "insert",
        frames.length,
        `Geser index ${sourceIndex} ke ${sourceIndex + 1}`,
        `Elemen ${shifted.value} digeser satu posisi ke kanan sebelum elemen baru ditempatkan.`,
        transitionState,
        "shift",
        [[shifted.id, "active"], [fresh.id, "new"]],
      ),
    );
  }

  placements = [...placements, { itemId: fresh.id, index }];
  transitionState = withTransition(state, {
    kind: "insert",
    placements,
    extraItems: [fresh],
  });
  frames.push(
    frame(
      "insert",
      frames.length,
      `Tempatkan ${value}`,
      `Elemen baru ditempatkan pada index ${index}.`,
      transitionState,
      "place",
      [[fresh.id, "new"]],
    ),
  );

  const finalItems = [...state.items];
  finalItems.splice(index, 0, fresh);
  const completed: ArrayState = {
    items: finalItems,
    nextItemOrdinal: state.nextItemOrdinal + 1,
    transition: null,
  };
  frames.push(
    frame(
      "insert",
      frames.length,
      "Insert selesai",
      `Panjang Array menjadi ${completed.items.length}. Elemen lama mempertahankan ID-nya.`,
      completed,
      "size",
      [[fresh.id, "found"]],
    ),
  );
  return trace("insert", `${stateFingerprint(state)}:${index}:${value}`, frames);
}

export function simulateDelete(rawInput: IndexInput) {
  const { state, index } = parseInput(
    indexInputSchema as unknown as ZodType<IndexInput>,
    rawInput,
  );
  assertExistingIndex(state, index);
  const target = state.items[index]!;
  let placements: readonly ArrayPlacement[] = defaultPlacements(state).filter(
    (placement) => placement.itemId !== target.id,
  );
  let transitionState = withTransition(state, {
    kind: "delete",
    placements,
    extraItems: [],
  });
  const frames: Frame[] = [
    frame(
      "delete",
      0,
      `Pilih index ${index}`,
      `Elemen ${target.value} ditandai untuk dihapus.`,
      state,
      "select",
      [[target.id, "selected"]],
    ),
    frame(
      "delete",
      1,
      "Lepaskan target",
      `Elemen pada index ${index} dikeluarkan dari slot aktif sebelum pergeseran.`,
      transitionState,
      "select",
      [[target.id, "removed"]],
    ),
  ];

  for (let sourceIndex = index + 1; sourceIndex < state.items.length; sourceIndex += 1) {
    const shifted = state.items[sourceIndex]!;
    placements = movePlacement(placements, shifted.id, sourceIndex - 1);
    transitionState = withTransition(state, {
      kind: "delete",
      placements,
      extraItems: [],
    });
    frames.push(
      frame(
        "delete",
        frames.length,
        `Geser index ${sourceIndex} ke ${sourceIndex - 1}`,
        `Elemen ${shifted.value} digeser satu posisi ke kiri untuk menutup ruang kosong.`,
        transitionState,
        "shift",
        [[target.id, "removed"], [shifted.id, "active"]],
      ),
    );
  }

  const completed: ArrayState = {
    ...state,
    items: state.items.filter((item) => item.id !== target.id),
    transition: null,
  };
  frames.push(
    frame(
      "delete",
      frames.length,
      "Delete selesai",
      index === state.items.length - 1
        ? `Elemen terakhir dihapus tanpa pergeseran. Panjang Array menjadi ${completed.items.length}.`
        : `Pergeseran selesai. Panjang Array menjadi ${completed.items.length}.`,
      completed,
      "size",
    ),
  );
  return trace("delete", `${stateFingerprint(state)}:${index}`, frames);
}

export const arrayAlgorithms = {
  access: definition(
    "access",
    "Access",
    indexInputSchema as unknown as ZodType<IndexInput>,
    simulateAccess,
  ),
  update: definition(
    "update",
    "Update",
    updateInputSchema as unknown as ZodType<UpdateInput>,
    simulateUpdate,
  ),
  traversal: definition(
    "traversal",
    "Traversal",
    stateInputSchema as unknown as ZodType<StateInput>,
    simulateTraversal,
  ),
  insert: definition(
    "insert",
    "Insert",
    insertInputSchema as unknown as ZodType<InsertInput>,
    simulateInsert,
  ),
  delete: definition(
    "delete",
    "Delete",
    indexInputSchema as unknown as ZodType<IndexInput>,
    simulateDelete,
  ),
} as const;

export function finalState(
  simulationTrace: SimulationTrace<ArrayState, ArrayVisualState>,
): ArrayState {
  return getFinalFrame(simulationTrace).state;
}
