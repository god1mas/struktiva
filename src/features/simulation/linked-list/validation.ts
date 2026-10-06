import { z } from "zod";
import {
  LINKED_LIST_MAX_NODES,
  LINKED_LIST_MAX_VALUE,
  LINKED_LIST_MIN_VALUE,
  getOrderedNodes,
} from "./state";
import type { LinkedListState } from "./types";

const nodeSchema = z.object({
  id: z.string().min(1),
  value: z.number().int().min(LINKED_LIST_MIN_VALUE).max(LINKED_LIST_MAX_VALUE),
  nextId: z.string().min(1).nullable(),
});

export const linkedListStateSchema = z
  .object({
    headId: z.string().min(1).nullable(),
    nodes: z.array(nodeSchema).max(LINKED_LIST_MAX_NODES + 1),
    temporaryNodeIds: z.array(z.string().min(1)).max(1),
    nextNodeOrdinal: z.number().int().nonnegative(),
  })
  .superRefine((state, context) => {
    const ids = state.nodes.map((node) => node.id);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({ code: "custom", message: "ID node harus unik." });
    }

    const known = new Set(ids);
    if (state.headId !== null && !known.has(state.headId)) {
      context.addIssue({ code: "custom", message: "HEAD harus menunjuk node yang ada." });
    }

    for (const node of state.nodes) {
      if (node.nextId !== null && !known.has(node.nextId)) {
        context.addIssue({ code: "custom", message: "Pointer next harus valid." });
      }
    }
  });

export const stateInputSchema = z.object({ state: linkedListStateSchema });
export const valueInputSchema = stateInputSchema.extend({
  value: z.number().int().min(LINKED_LIST_MIN_VALUE).max(LINKED_LIST_MAX_VALUE),
});
export const positionInputSchema = stateInputSchema.extend({
  position: z.number().int().nonnegative(),
});
export const valuePositionInputSchema = valueInputSchema.extend({
  position: z.number().int().nonnegative(),
});

export class LinkedListInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LinkedListInputError";
  }
}

export function parseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new LinkedListInputError(result.error.issues[0]?.message ?? "Input tidak valid.");
  }

  return result.data;
}

export function listSize(state: LinkedListState): number {
  try {
    return getOrderedNodes(state).length;
  } catch {
    throw new LinkedListInputError("Struktur linked list tidak valid.");
  }
}

export function assertCanInsert(state: LinkedListState): void {
  if (listSize(state) >= LINKED_LIST_MAX_NODES) {
    throw new LinkedListInputError(
      `Linked list sudah mencapai batas ${LINKED_LIST_MAX_NODES} node.`,
    );
  }
}

export function assertNotEmpty(state: LinkedListState): void {
  if (listSize(state) === 0) {
    throw new LinkedListInputError("Linked list kosong; tidak ada node yang dapat dihapus.");
  }
}

export function assertInsertPosition(
  state: LinkedListState,
  position: number,
): void {
  const size = listSize(state);
  if (position < 0 || position > size) {
    throw new LinkedListInputError(`Posisi sisip harus berada di antara 0 dan ${size}.`);
  }
}

export function assertDeletePosition(
  state: LinkedListState,
  position: number,
): void {
  const size = listSize(state);
  if (position < 0 || position >= size) {
    const upper = Math.max(0, size - 1);
    throw new LinkedListInputError(
      size === 0
        ? "Linked list kosong; tidak ada posisi yang dapat dihapus."
        : `Posisi hapus harus berada di antara 0 dan ${upper}.`,
    );
  }
}
