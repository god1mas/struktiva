import { z } from "zod";
import {
  ARRAY_MAX_ITEMS,
  ARRAY_MAX_VALUE,
  ARRAY_MIN_VALUE,
} from "./state";
import type { ArrayState } from "./types";

const itemSchema = z.object({
  id: z.string().min(1),
  value: z.number().int().min(ARRAY_MIN_VALUE).max(ARRAY_MAX_VALUE),
});

const placementSchema = z.object({
  itemId: z.string().min(1),
  index: z.number().int().nonnegative().max(ARRAY_MAX_ITEMS),
});

export const arrayStateSchema = z
  .object({
    items: z.array(itemSchema).max(ARRAY_MAX_ITEMS),
    nextItemOrdinal: z.number().int().nonnegative(),
    transition: z
      .object({
        kind: z.enum(["insert", "delete"]),
        placements: z.array(placementSchema).max(ARRAY_MAX_ITEMS),
        extraItems: z.array(itemSchema).max(1),
      })
      .nullable(),
  })
  .superRefine((state, context) => {
    const allIds = [
      ...state.items.map((item) => item.id),
      ...(state.transition?.extraItems.map((item) => item.id) ?? []),
    ];
    if (new Set(allIds).size !== allIds.length) {
      context.addIssue({ code: "custom", message: "ID elemen Array harus unik." });
    }
    if (state.transition) {
      const knownIds = new Set(allIds);
      const placementIds = state.transition.placements.map((placement) => placement.itemId);
      const indexes = state.transition.placements.map((placement) => placement.index);
      if (placementIds.some((id) => !knownIds.has(id))) {
        context.addIssue({ code: "custom", message: "Placement harus merujuk elemen yang ada." });
      }
      if (new Set(placementIds).size !== placementIds.length) {
        context.addIssue({ code: "custom", message: "Elemen tidak boleh memiliki dua placement." });
      }
      if (new Set(indexes).size !== indexes.length) {
        context.addIssue({ code: "custom", message: "Dua elemen tidak boleh menempati indeks yang sama." });
      }
    }
  });

export const stateInputSchema = z.object({ state: arrayStateSchema });
export const indexInputSchema = stateInputSchema.extend({ index: z.number().int() });
export const updateInputSchema = indexInputSchema.extend({
  value: z.number(),
});
export const insertInputSchema = updateInputSchema;

export class ArrayInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ArrayInputError";
  }
}

export function parseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ArrayInputError(
      result.error.issues[0]?.message ?? "Input Array tidak valid.",
    );
  }
  return result.data;
}

export function assertValue(value: number): void {
  if (!Number.isInteger(value) || value < ARRAY_MIN_VALUE || value > ARRAY_MAX_VALUE) {
    throw new ArrayInputError(
      `Nilai harus berupa bilangan bulat antara ${ARRAY_MIN_VALUE} dan ${ARRAY_MAX_VALUE}.`,
    );
  }
}

export function assertExistingIndex(state: ArrayState, index: number): void {
  if (state.items.length === 0) {
    throw new ArrayInputError("Array kosong; tidak ada indeks yang dapat dipilih.");
  }
  if (!Number.isInteger(index) || index < 0 || index >= state.items.length) {
    throw new ArrayInputError(
      `Index harus berada di antara 0 dan ${state.items.length - 1}.`,
    );
  }
}

export function assertInsertIndex(state: ArrayState, index: number): void {
  if (!Number.isInteger(index) || index < 0 || index > state.items.length) {
    throw new ArrayInputError(
      `Index sisip harus berada di antara 0 dan ${state.items.length}.`,
    );
  }
}

export function assertCanInsert(state: ArrayState): void {
  if (state.items.length >= ARRAY_MAX_ITEMS) {
    throw new ArrayInputError(
      `Array sudah mencapai batas ${ARRAY_MAX_ITEMS} elemen.`,
    );
  }
}
