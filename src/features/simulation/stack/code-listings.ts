import {
  codeLineId,
  type CodeLineId,
  type CodeListing,
  type SynchronizedCode,
} from "../core";
import type { StackOperationKey } from "./types";

type SourceLine = readonly [key: string, content: string];

function listing<Language extends "cpp" | "pseudocode">(
  operation: StackOperationKey,
  language: Language,
  lines: readonly SourceLine[],
): CodeListing<Language> {
  return {
    language,
    lines: lines.map(([key, content]) => ({
      id: codeLine(operation, language, key),
      content,
    })),
  };
}

function synchronized(
  operation: StackOperationKey,
  cpp: readonly SourceLine[],
  pseudocode: readonly SourceLine[],
): SynchronizedCode {
  return {
    cpp: listing(operation, "cpp", [
      ["storage", "int items[8]; int top = -1; // fixed-capacity Array"],
      ...cpp,
    ]),
    pseudocode: listing(operation, "pseudocode", [
      ["storage", "KAPASITAS ← 8; TOP ← -1"],
      ...pseudocode,
    ]),
  };
}

export function codeLine(
  operation: StackOperationKey,
  language: "cpp" | "pseudocode",
  key: string,
): CodeLineId {
  return codeLineId(`stack:${operation}:${language}:${key}`);
}

export function activeLines(operation: StackOperationKey, key: string) {
  return {
    activeCppLineIds: [codeLine(operation, "cpp", key)],
    activePseudocodeLineIds: [codeLine(operation, "pseudocode", key)],
  };
}

export const stackCode: Readonly<Record<StackOperationKey, SynchronizedCode>> = {
  push: synchronized(
    "push",
    [
      ["check", "if (top == CAPACITY - 1) return; // overflow"],
      ["move", "top = top + 1;"],
      ["write", "items[top] = value;"],
      ["done", "return;"],
    ],
    [
      ["check", "JIKA TOP = KAPASITAS - 1: GAGAL (overflow)"],
      ["move", "TOP ← TOP + 1"],
      ["write", "items[TOP] ← nilai"],
      ["done", "SELESAI"],
    ],
  ),
  pop: synchronized(
    "pop",
    [
      ["check", "if (top == -1) return; // underflow"],
      ["read", "int removed = items[top];"],
      ["move", "top = top - 1;"],
      ["done", "return removed;"],
    ],
    [
      ["check", "JIKA TOP = -1: GAGAL (underflow)"],
      ["read", "terhapus ← items[TOP]"],
      ["move", "TOP ← TOP - 1"],
      ["done", "KEMBALIKAN terhapus"],
    ],
  ),
  peek: synchronized(
    "peek",
    [
      ["check", "if (top == -1) return; // underflow"],
      ["read", "int value = items[top];"],
      ["done", "return value;"],
    ],
    [
      ["check", "JIKA TOP = -1: GAGAL (underflow)"],
      ["read", "nilai ← items[TOP]"],
      ["done", "KEMBALIKAN nilai"],
    ],
  ),
  "is-empty": synchronized(
    "is-empty",
    [["check", "bool empty = (top == -1);"], ["done", "return empty;"]],
    [["check", "kosong ← (TOP = -1)"], ["done", "KEMBALIKAN kosong"]],
  ),
  "is-full": synchronized(
    "is-full",
    [["check", "bool full = (top == CAPACITY - 1);"], ["done", "return full;"]],
    [["check", "penuh ← (TOP = KAPASITAS - 1)"], ["done", "KEMBALIKAN penuh"]],
  ),
};
