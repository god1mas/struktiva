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
import { activeLines, linkedListCode } from "./code-listings";
import {
  attachTemporaryNode,
  createTemporaryNode,
  getNode,
  getOrderedNodes,
  removeNode,
  semanticOverrides,
  updateNode,
  visualStates,
} from "./state";
import type {
  LinkedListOperationKey,
  LinkedListState,
  LinkedListVisualState,
  PositionInput,
  StateInput,
  ValueInput,
  ValuePositionInput,
} from "./types";
import {
  assertCanInsert,
  assertDeletePosition,
  assertInsertPosition,
  assertNotEmpty,
  parseInput,
  positionInputSchema,
  stateInputSchema,
  valueInputSchema,
  valuePositionInputSchema,
} from "./validation";

type Frame = SimulationFrame<LinkedListState, LinkedListVisualState>;
type VisualEntry = readonly [StableElementId, SemanticVisualState];

function frame(
  operation: LinkedListOperationKey,
  index: number,
  title: string,
  explanation: string,
  state: LinkedListState,
  lineKey: string,
  overrides: readonly VisualEntry[] = [],
): Frame {
  return {
    id: simulationFrameId(`${operation}:frame:${index}`),
    title,
    explanation,
    state,
    visualState: visualStates(state, semanticOverrides(overrides)),
    ...activeLines(operation, lineKey),
  };
}

function trace(
  operation: LinkedListOperationKey,
  discriminator: string,
  frames: readonly Frame[],
): SimulationTrace<LinkedListState, LinkedListVisualState> {
  return validateSimulationTrace(
    {
      id: simulationTraceId(`${operation}:${discriminator}`),
      frames,
    },
    linkedListCode[operation],
  );
}

function definition<Input>(
  operation: LinkedListOperationKey,
  title: string,
  inputSchema: ZodType<Input>,
  simulate: (input: Input) => SimulationTrace<LinkedListState, LinkedListVisualState>,
): AlgorithmDefinition<Input, LinkedListState, LinkedListVisualState> {
  return {
    key: operation,
    domain: "linked-list",
    title,
    inputSchema,
    code: linkedListCode[operation],
    simulate,
  };
}

export function simulateTraversal(rawInput: StateInput) {
  const { state } = parseInput(stateInputSchema as unknown as ZodType<StateInput>, rawInput);
  const nodes = getOrderedNodes(state);
  const frames: Frame[] = [
    frame(
      "traversal",
      0,
      "Mulai dari HEAD",
      nodes.length === 0
        ? "HEAD bernilai NULL, sehingga tidak ada node yang perlu dikunjungi."
        : "Pointer current ditempatkan pada HEAD.",
      state,
      "start",
      nodes[0] ? [[nodes[0].id, "active"]] : [],
    ),
  ];

  nodes.forEach((node, index) => {
    frames.push(
      frame(
        "traversal",
        frames.length,
        `Kunjungi node ${index}`,
        `Nilai ${node.value} dibaca pada posisi ${index}.`,
        state,
        "visit",
        nodes.map((candidate, candidateIndex) => [
          candidate.id,
          candidateIndex === index
            ? "active"
            : candidateIndex < index
              ? "muted"
              : "normal",
        ]),
      ),
    );

    if (index < nodes.length - 1) {
      frames.push(
        frame(
          "traversal",
          frames.length,
          "Majukan pointer",
          "current berpindah mengikuti pointer next.",
          state,
          "advance",
          [[nodes[index + 1]!.id, "selected"]],
        ),
      );
    }
  });

  frames.push(
    frame(
      "traversal",
      frames.length,
      "Traversal selesai",
      `current mencapai NULL setelah ${nodes.length} node dikunjungi.`,
      state,
      "done",
      nodes.map((node) => [node.id, "muted"]),
    ),
  );

  return trace("traversal", `${state.headId ?? "empty"}:${state.nextNodeOrdinal}`, frames);
}

export function simulateSearch(rawInput: ValueInput) {
  const { state, value } = parseInput(
    valueInputSchema as unknown as ZodType<ValueInput>,
    rawInput,
  );
  const nodes = getOrderedNodes(state);
  const frames: Frame[] = [
    frame(
      "search",
      0,
      "Mulai pencarian",
      `Cari nilai ${value} mulai dari HEAD.`,
      state,
      "start",
      nodes[0] ? [[nodes[0].id, "active"]] : [],
    ),
  ];
  let found = false;

  for (const [index, node] of nodes.entries()) {
    const matches = node.value === value;
    frames.push(
      frame(
        "search",
        frames.length,
        matches ? "Nilai ditemukan" : `Bandingkan posisi ${index}`,
        matches
          ? `${node.value} sama dengan target ${value}; pencarian berhenti pada kecocokan pertama.`
          : `${node.value} tidak sama dengan ${value}.`,
        state,
        "compare",
        nodes.map((candidate, candidateIndex) => [
          candidate.id,
          candidate.id === node.id
            ? matches
              ? "found"
              : "compared"
            : candidateIndex < index
              ? "muted"
              : "normal",
        ]),
      ),
    );

    if (matches) {
      found = true;
      break;
    }

    if (index < nodes.length - 1) {
      frames.push(
        frame(
          "search",
          frames.length,
          "Lanjut ke node berikutnya",
          "Pointer current mengikuti next karena target belum ditemukan.",
          state,
          "advance",
          [[nodes[index + 1]!.id, "active"]],
        ),
      );
    }
  }

  if (!found) {
    frames.push(
      frame(
        "search",
        frames.length,
        "Target tidak ditemukan",
        `Pointer mencapai NULL tanpa menemukan nilai ${value}.`,
        state,
        "done",
        nodes.map((node) => [node.id, "muted"]),
      ),
    );
  }

  return trace("search", `${state.headId ?? "empty"}:${value}`, frames);
}

export function simulateInsertHead(rawInput: ValueInput) {
  const { state, value } = parseInput(
    valueInputSchema as unknown as ZodType<ValueInput>,
    rawInput,
  );
  assertCanInsert(state);
  const created = createTemporaryNode(state, value);
  const connected = updateNode(created.state, created.id, (node) => ({
    ...node,
    nextId: state.headId,
  }));
  const moved = attachTemporaryNode(
    { ...connected, headId: created.id },
    created.id,
  );
  const frames = [
    frame("insert-head", 0, "Siapkan penyisipan", "Node baru akan dibuat.", state, "create"),
    frame(
      "insert-head",
      1,
      "Buat node baru",
      `Node baru berisi ${value}; node ini belum terhubung ke list.`,
      created.state,
      "create",
      [[created.id, "new"]],
    ),
    frame(
      "insert-head",
      2,
      "Hubungkan ke HEAD lama",
      "Pointer next node baru diarahkan ke HEAD lama.",
      connected,
      "connect",
      [[created.id, "new"]],
    ),
    frame(
      "insert-head",
      3,
      "Pindahkan HEAD",
      "HEAD sekarang menunjuk node baru; penyisipan selesai.",
      moved,
      "head",
      [[created.id, "found"]],
    ),
  ];
  return trace("insert-head", `${state.nextNodeOrdinal}:${value}`, frames);
}

export function simulateInsertTail(rawInput: ValueInput) {
  const { state, value } = parseInput(
    valueInputSchema as unknown as ZodType<ValueInput>,
    rawInput,
  );
  assertCanInsert(state);
  const nodes = getOrderedNodes(state);
  const created = createTemporaryNode(state, value);
  const frames: Frame[] = [
    frame("insert-tail", 0, "Siapkan penyisipan", "Node baru akan dibuat.", state, "create"),
    frame(
      "insert-tail",
      1,
      "Buat node baru",
      `Node baru berisi ${value} dan next bernilai NULL.`,
      created.state,
      "create",
      [[created.id, "new"]],
    ),
  ];

  if (nodes.length === 0) {
    const completed = attachTemporaryNode(
      { ...created.state, headId: created.id },
      created.id,
    );
    frames.push(
      frame(
        "insert-tail",
        frames.length,
        "List kosong",
        "Karena HEAD masih NULL, HEAD langsung menunjuk node baru.",
        completed,
        "empty",
        [[created.id, "found"]],
      ),
    );
    return trace("insert-tail", `${state.nextNodeOrdinal}:${value}`, frames);
  }

  frames.push(
    frame(
      "insert-tail",
      frames.length,
      "Mulai dari HEAD",
      "Cari tail dengan mengikuti pointer next.",
      created.state,
      "start",
      [[nodes[0]!.id, "active"], [created.id, "new"]],
    ),
  );
  for (const node of nodes.slice(1)) {
    frames.push(
      frame(
        "insert-tail",
        frames.length,
        "Bergerak menuju tail",
        `current berpindah ke node bernilai ${node.value}.`,
        created.state,
        "walk",
        [[node.id, "active"], [created.id, "new"]],
      ),
    );
  }
  const tail = nodes.at(-1)!;
  const connected = attachTemporaryNode(
    updateNode(created.state, tail.id, (node) => ({ ...node, nextId: created.id })),
    created.id,
  );
  frames.push(
    frame(
      "insert-tail",
      frames.length,
      "Hubungkan tail",
      "Pointer next pada tail diarahkan ke node baru.",
      connected,
      "connect",
      [[tail.id, "selected"], [created.id, "found"]],
    ),
  );
  return trace("insert-tail", `${state.nextNodeOrdinal}:${value}`, frames);
}

export function simulateInsertPosition(rawInput: ValuePositionInput) {
  const { state, value, position } = parseInput(
    valuePositionInputSchema as unknown as ZodType<ValuePositionInput>,
    rawInput,
  );
  assertCanInsert(state);
  assertInsertPosition(state, position);
  const nodes = getOrderedNodes(state);
  const created = createTemporaryNode(state, value);
  const frames: Frame[] = [
    frame(
      "insert-position",
      0,
      "Siapkan penyisipan",
      `Node akan disisipkan pada posisi ${position}.`,
      state,
      "create",
    ),
    frame(
      "insert-position",
      1,
      "Buat node baru",
      `Node baru berisi ${value} dan belum terhubung.`,
      created.state,
      "create",
      [[created.id, "new"]],
    ),
  ];

  if (position === 0) {
    const linked = updateNode(created.state, created.id, (node) => ({
      ...node,
      nextId: state.headId,
    }));
    const completed = attachTemporaryNode(
      { ...linked, headId: created.id },
      created.id,
    );
    frames.push(
      frame(
        "insert-position",
        frames.length,
        "Sisipkan di posisi 0",
        "Node baru menunjuk HEAD lama, lalu HEAD dipindahkan ke node baru.",
        completed,
        "head",
        [[created.id, "found"]],
      ),
    );
    return trace("insert-position", `${state.nextNodeOrdinal}:${value}:${position}`, frames);
  }

  for (let index = 0; index < position; index += 1) {
    const node = nodes[index]!;
    frames.push(
      frame(
        "insert-position",
        frames.length,
        index === position - 1 ? "Predecessor ditemukan" : "Cari predecessor",
        `Pointer berada pada posisi ${index}.`,
        created.state,
        index === 0 ? "start" : "walk",
        [[node.id, index === position - 1 ? "selected" : "active"], [created.id, "new"]],
      ),
    );
  }
  const previous = nodes[position - 1]!;
  const linkedNew = updateNode(created.state, created.id, (node) => ({
    ...node,
    nextId: previous.nextId,
  }));
  frames.push(
    frame(
      "insert-position",
      frames.length,
      "Hubungkan node baru",
      "Pointer next node baru diarahkan ke successor.",
      linkedNew,
      "connect-new",
      [[previous.id, "selected"], [created.id, "new"]],
    ),
  );
  const completed = attachTemporaryNode(
    updateNode(linkedNew, previous.id, (node) => ({ ...node, nextId: created.id })),
    created.id,
  );
  frames.push(
    frame(
      "insert-position",
      frames.length,
      "Hubungkan predecessor",
      "Pointer predecessor sekarang menunjuk node baru; penyisipan selesai.",
      completed,
      "connect-prev",
      [[previous.id, "selected"], [created.id, "found"]],
    ),
  );
  return trace("insert-position", `${state.nextNodeOrdinal}:${value}:${position}`, frames);
}

export function simulateDeleteHead(rawInput: StateInput) {
  const { state } = parseInput(stateInputSchema as unknown as ZodType<StateInput>, rawInput);
  assertNotEmpty(state);
  const target = getNode(state, state.headId!);
  const moved = { ...state, headId: target.nextId };
  const completed = removeNode(moved, target.id);
  return trace("delete-head", `${state.headId}`, [
    frame(
      "delete-head",
      0,
      "Pilih HEAD",
      `Node bernilai ${target.value} ditandai sebagai target.`,
      state,
      "select",
      [[target.id, "selected"]],
    ),
    frame(
      "delete-head",
      1,
      "Pindahkan HEAD",
      "HEAD dipindahkan ke node berikutnya sebelum target dihapus.",
      moved,
      "head",
      [[target.id, "removed"]],
    ),
    frame(
      "delete-head",
      2,
      "Hapus node",
      "Target dilepas dari memori simulasi.",
      completed,
      "remove",
    ),
  ]);
}

export function simulateDeleteTail(rawInput: StateInput) {
  const { state } = parseInput(stateInputSchema as unknown as ZodType<StateInput>, rawInput);
  assertNotEmpty(state);
  const nodes = getOrderedNodes(state);
  const tail = nodes.at(-1)!;
  const frames: Frame[] = [];

  if (nodes.length === 1) {
    frames.push(
      frame(
        "delete-tail",
        0,
        "Tail juga HEAD",
        "List hanya memiliki satu node; node ini dipilih untuk dihapus.",
        state,
        "single",
        [[tail.id, "removed"]],
      ),
      frame(
        "delete-tail",
        1,
        "List menjadi kosong",
        "HEAD diatur ke NULL dan node terakhir dilepas.",
        removeNode({ ...state, headId: null }, tail.id),
        "remove",
      ),
    );
    return trace("delete-tail", `${state.headId}`, frames);
  }

  frames.push(
    frame(
      "delete-tail",
      0,
      "Mulai dari HEAD",
      "Cari node tepat sebelum tail.",
      state,
      "start",
      [[nodes[0]!.id, "active"]],
    ),
  );
  for (let index = 1; index < nodes.length - 1; index += 1) {
    frames.push(
      frame(
        "delete-tail",
        frames.length,
        index === nodes.length - 2 ? "Predecessor tail ditemukan" : "Bergerak menuju tail",
        `Pointer previous berada pada posisi ${index}.`,
        state,
        "walk",
        [[nodes[index]!.id, index === nodes.length - 2 ? "selected" : "active"]],
      ),
    );
  }
  const previous = nodes.at(-2)!;
  frames.push(
    frame(
      "delete-tail",
      frames.length,
      "Pilih tail",
      `Node bernilai ${tail.value} adalah target penghapusan.`,
      state,
      "select",
      [[previous.id, "selected"], [tail.id, "removed"]],
    ),
  );
  const disconnected = updateNode(state, previous.id, (node) => ({ ...node, nextId: null }));
  frames.push(
    frame(
      "delete-tail",
      frames.length,
      "Putuskan pointer",
      "next pada predecessor diatur ke NULL.",
      disconnected,
      "disconnect",
      [[previous.id, "selected"], [tail.id, "removed"]],
    ),
    frame(
      "delete-tail",
      frames.length + 1,
      "Hapus tail",
      "Node tail dilepas dari memori simulasi.",
      removeNode(disconnected, tail.id),
      "remove",
      [[previous.id, "found"]],
    ),
  );
  return trace("delete-tail", `${state.headId}`, frames);
}

export function simulateDeletePosition(rawInput: PositionInput) {
  const { state, position } = parseInput(
    positionInputSchema as unknown as ZodType<PositionInput>,
    rawInput,
  );
  assertDeletePosition(state, position);
  const nodes = getOrderedNodes(state);
  const target = nodes[position]!;
  const frames: Frame[] = [];

  if (position === 0) {
    const moved = { ...state, headId: target.nextId };
    frames.push(
      frame(
        "delete-position",
        0,
        "Pilih posisi 0",
        "Target adalah HEAD saat ini.",
        state,
        "head",
        [[target.id, "removed"]],
      ),
      frame(
        "delete-position",
        1,
        "Pindahkan HEAD",
        "HEAD dipindahkan ke successor target.",
        moved,
        "head",
        [[target.id, "removed"]],
      ),
      frame(
        "delete-position",
        2,
        "Hapus target",
        "Target dilepas dari memori simulasi.",
        removeNode(moved, target.id),
        "remove",
      ),
    );
    return trace("delete-position", `${state.headId}:${position}`, frames);
  }

  frames.push(
    frame(
      "delete-position",
      0,
      "Mulai dari HEAD",
      `Cari node sebelum posisi ${position}.`,
      state,
      "start",
      [[nodes[0]!.id, "active"]],
    ),
  );
  for (let index = 1; index < position; index += 1) {
    frames.push(
      frame(
        "delete-position",
        frames.length,
        index === position - 1 ? "Predecessor ditemukan" : "Majukan pointer",
        `Pointer previous berada pada posisi ${index}.`,
        state,
        "walk",
        [[nodes[index]!.id, index === position - 1 ? "selected" : "active"]],
      ),
    );
  }
  const previous = nodes[position - 1]!;
  frames.push(
    frame(
      "delete-position",
      frames.length,
      "Pilih target",
      `Node bernilai ${target.value} pada posisi ${position} akan dihapus.`,
      state,
      "select",
      [[previous.id, "selected"], [target.id, "removed"]],
    ),
  );
  const disconnected = updateNode(state, previous.id, (node) => ({
    ...node,
    nextId: target.nextId,
  }));
  frames.push(
    frame(
      "delete-position",
      frames.length,
      "Lewati target",
      "Pointer predecessor diarahkan langsung ke successor target.",
      disconnected,
      "disconnect",
      [[previous.id, "selected"], [target.id, "removed"]],
    ),
    frame(
      "delete-position",
      frames.length + 1,
      "Hapus target",
      "Target dilepas dari memori simulasi.",
      removeNode(disconnected, target.id),
      "remove",
      [[previous.id, "found"]],
    ),
  );
  return trace("delete-position", `${state.headId}:${position}`, frames);
}

export const linkedListAlgorithms = {
  traversal: definition(
    "traversal",
    "Traversal",
    stateInputSchema as unknown as ZodType<StateInput>,
    simulateTraversal,
  ),
  search: definition(
    "search",
    "Search",
    valueInputSchema as unknown as ZodType<ValueInput>,
    simulateSearch,
  ),
  "insert-head": definition(
    "insert-head",
    "Insert Head",
    valueInputSchema as unknown as ZodType<ValueInput>,
    simulateInsertHead,
  ),
  "insert-tail": definition(
    "insert-tail",
    "Insert Tail",
    valueInputSchema as unknown as ZodType<ValueInput>,
    simulateInsertTail,
  ),
  "insert-position": definition(
    "insert-position",
    "Insert Position",
    valuePositionInputSchema as unknown as ZodType<ValuePositionInput>,
    simulateInsertPosition,
  ),
  "delete-head": definition(
    "delete-head",
    "Delete Head",
    stateInputSchema as unknown as ZodType<StateInput>,
    simulateDeleteHead,
  ),
  "delete-tail": definition(
    "delete-tail",
    "Delete Tail",
    stateInputSchema as unknown as ZodType<StateInput>,
    simulateDeleteTail,
  ),
  "delete-position": definition(
    "delete-position",
    "Delete Position",
    positionInputSchema as unknown as ZodType<PositionInput>,
    simulateDeletePosition,
  ),
} as const;

export function finalState(
  simulationTrace: SimulationTrace<LinkedListState, LinkedListVisualState>,
): LinkedListState {
  return getFinalFrame(simulationTrace).state;
}
