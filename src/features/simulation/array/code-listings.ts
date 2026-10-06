import {
  codeLineId,
  type CodeLineId,
  type CodeListing,
  type SynchronizedCode,
} from "../core";
import type { ArrayOperationKey } from "./types";

type SourceLine = readonly [key: string, content: string];

function listing<Language extends "cpp" | "pseudocode">(
  operation: ArrayOperationKey,
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
  operation: ArrayOperationKey,
  cpp: readonly SourceLine[],
  pseudocode: readonly SourceLine[],
): SynchronizedCode {
  return {
    cpp: listing(operation, "cpp", cpp),
    pseudocode: listing(operation, "pseudocode", pseudocode),
  };
}

export function codeLine(
  operation: ArrayOperationKey,
  language: "cpp" | "pseudocode",
  key: string,
): CodeLineId {
  return codeLineId(`${operation}:${language}:${key}`);
}

export function activeLines(operation: ArrayOperationKey, key: string) {
  return {
    activeCppLineIds: [codeLine(operation, "cpp", key)],
    activePseudocodeLineIds: [codeLine(operation, "pseudocode", key)],
  };
}

export const arrayCode: Readonly<Record<ArrayOperationKey, SynchronizedCode>> = {
  access: synchronized(
    "access",
    [["locate", "int value = arr[index];"], ["return", "return value;"]],
    [["locate", "value ← arr[index]"], ["return", "KEMBALIKAN value"]],
  ),
  update: synchronized(
    "update",
    [["locate", "// pilih arr[index]"], ["assign", "arr[index] = newValue;"], ["done", "return;"]],
    [["locate", "PILIH arr[index]"], ["assign", "arr[index] ← nilaiBaru"], ["done", "SELESAI"]],
  ),
  traversal: synchronized(
    "traversal",
    [["start", "for (int i = 0; i < size; ++i) {"], ["visit", "  visit(arr[i]);"], ["done", "}"]],
    [["start", "UNTUK i dari 0 sampai size - 1"], ["visit", "  KUNJUNGI arr[i]"], ["done", "SELESAI"]],
  ),
  insert: synchronized(
    "insert",
    [
      ["space", "// pastikan kapasitas masih tersedia"],
      ["shift", "for (int i = size; i > index; --i) arr[i] = arr[i - 1];"],
      ["place", "arr[index] = value;"],
      ["size", "size = size + 1;"],
    ],
    [
      ["space", "BUAT ruang pada index"],
      ["shift", "UNTUK i dari size turun ke index + 1: arr[i] ← arr[i - 1]"],
      ["place", "arr[index] ← value"],
      ["size", "size ← size + 1"],
    ],
  ),
  delete: synchronized(
    "delete",
    [
      ["select", "// pilih arr[index] untuk dihapus"],
      ["shift", "for (int i = index; i < size - 1; ++i) arr[i] = arr[i + 1];"],
      ["size", "size = size - 1;"],
    ],
    [
      ["select", "PILIH arr[index] untuk dihapus"],
      ["shift", "UNTUK i dari index sampai size - 2: arr[i] ← arr[i + 1]"],
      ["size", "size ← size - 1"],
    ],
  ),
};
