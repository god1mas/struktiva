import { z } from "zod";
import { STACK_CAPACITY, STACK_MAX_VALUE, STACK_MIN_VALUE } from "./state";
import type { StackState } from "./types";

const itemSchema = z.object({
  id: z.string().min(1),
  value: z.number().int().min(STACK_MIN_VALUE).max(STACK_MAX_VALUE),
});

export const stackStateSchema = z
  .object({
    items: z.array(itemSchema).max(STACK_CAPACITY),
    nextItemOrdinal: z.number().int().nonnegative(),
    capacity: z.literal(STACK_CAPACITY),
    transition: z
      .object({
        kind: z.enum(["push", "pop"]),
        detachedItems: z.array(itemSchema).max(1),
      })
      .nullable(),
  })
  .superRefine((state, context) => {
    const ids = [
      ...state.items.map((item) => item.id),
      ...(state.transition?.detachedItems.map((item) => item.id) ?? []),
    ];
    if (new Set(ids).size !== ids.length) {
      context.addIssue({ code: "custom", message: "ID elemen Stack harus unik." });
    }
  });

export const stateInputSchema = z.object({ state: stackStateSchema });
export const valueInputSchema = stateInputSchema.extend({ value: z.number() });

export class StackInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StackInputError";
  }
}

export function parseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new StackInputError(
      result.error.issues[0]?.message ?? "Input Stack tidak valid.",
    );
  }
  return result.data;
}

export function assertValue(value: number): void {
  if (!Number.isInteger(value) || value < STACK_MIN_VALUE || value > STACK_MAX_VALUE) {
    throw new StackInputError(
      `Nilai harus berupa bilangan bulat antara ${STACK_MIN_VALUE} dan ${STACK_MAX_VALUE}.`,
    );
  }
}

export function assertCanPush(state: StackState): void {
  if (state.items.length >= state.capacity) {
    throw new StackInputError(
      `Stack penuh. Push tidak dapat dilakukan karena kapasitas ${STACK_CAPACITY} elemen sudah tercapai.`,
    );
  }
}

export function assertHasTop(state: StackState): void {
  if (state.items.length === 0) {
    throw new StackInputError("Stack kosong. Tidak ada elemen TOP yang dapat diambil.");
  }
}
