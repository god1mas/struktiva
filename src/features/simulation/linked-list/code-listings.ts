import {
  codeLineId,
  type CodeLineId,
  type CodeListing,
  type SynchronizedCode,
} from "../core";
import type { LinkedListOperationKey } from "./types";

type SourceLine = readonly [key: string, content: string];

function listing<Language extends "cpp" | "pseudocode">(
  operation: LinkedListOperationKey,
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
  operation: LinkedListOperationKey,
  cpp: readonly SourceLine[],
  pseudocode: readonly SourceLine[],
): SynchronizedCode {
  return {
    cpp: listing(operation, "cpp", cpp),
    pseudocode: listing(operation, "pseudocode", pseudocode),
  };
}

export function codeLine(
  operation: LinkedListOperationKey,
  language: "cpp" | "pseudocode",
  key: string,
): CodeLineId {
  return codeLineId(`${operation}:${language}:${key}`);
}

export function activeLines(
  operation: LinkedListOperationKey,
  key: string,
): {
  readonly activeCppLineIds: readonly CodeLineId[];
  readonly activePseudocodeLineIds: readonly CodeLineId[];
} {
  return {
    activeCppLineIds: [codeLine(operation, "cpp", key)],
    activePseudocodeLineIds: [codeLine(operation, "pseudocode", key)],
  };
}

export const linkedListCode: Readonly<
  Record<LinkedListOperationKey, SynchronizedCode>
> = {
  traversal: synchronized(
    "traversal",
    [
      ["start", "Node* current = head;"],
      ["loop", "while (current != nullptr) {"],
      ["visit", "  visit(current->value);"],
      ["advance", "  current = current->next;"],
      ["done", "}"],
    ],
    [
      ["start", "current ← HEAD"],
      ["loop", "WHILE current ≠ NULL"],
      ["visit", "  KUNJUNGI current.value"],
      ["advance", "  current ← current.next"],
      ["done", "SELESAI"],
    ],
  ),
  search: synchronized(
    "search",
    [
      ["start", "Node* current = head;"],
      ["loop", "while (current != nullptr) {"],
      ["compare", "  if (current->value == target) return current;"],
      ["advance", "  current = current->next;"],
      ["done", "return nullptr;"],
    ],
    [
      ["start", "current ← HEAD"],
      ["loop", "WHILE current ≠ NULL"],
      ["compare", "  JIKA current.value = target, KEMBALIKAN current"],
      ["advance", "  current ← current.next"],
      ["done", "KEMBALIKAN NULL"],
    ],
  ),
  "insert-head": synchronized(
    "insert-head",
    [
      ["create", "Node* fresh = new Node(value);"],
      ["connect", "fresh->next = head;"],
      ["head", "head = fresh;"],
      ["done", "return head;"],
    ],
    [
      ["create", "fresh ← NODE BARU(value)"],
      ["connect", "fresh.next ← HEAD"],
      ["head", "HEAD ← fresh"],
      ["done", "KEMBALIKAN HEAD"],
    ],
  ),
  "insert-tail": synchronized(
    "insert-tail",
    [
      ["create", "Node* fresh = new Node(value);"],
      ["empty", "if (head == nullptr) head = fresh;"],
      ["start", "Node* current = head;"],
      ["walk", "while (current->next != nullptr) current = current->next;"],
      ["connect", "current->next = fresh;"],
      ["done", "return head;"],
    ],
    [
      ["create", "fresh ← NODE BARU(value)"],
      ["empty", "JIKA HEAD = NULL, HEAD ← fresh"],
      ["start", "current ← HEAD"],
      ["walk", "SELAMA current.next ≠ NULL, MAJU"],
      ["connect", "current.next ← fresh"],
      ["done", "KEMBALIKAN HEAD"],
    ],
  ),
  "insert-position": synchronized(
    "insert-position",
    [
      ["create", "Node* fresh = new Node(value);"],
      ["head", "if (position == 0) { fresh->next = head; head = fresh; }"],
      ["start", "Node* previous = head;"],
      ["walk", "for (int i = 0; i < position - 1; ++i) previous = previous->next;"],
      ["connect-new", "fresh->next = previous->next;"],
      ["connect-prev", "previous->next = fresh;"],
      ["done", "return head;"],
    ],
    [
      ["create", "fresh ← NODE BARU(value)"],
      ["head", "JIKA posisi = 0, sambungkan fresh lalu pindahkan HEAD"],
      ["start", "previous ← HEAD"],
      ["walk", "MAJU hingga node sebelum posisi"],
      ["connect-new", "fresh.next ← previous.next"],
      ["connect-prev", "previous.next ← fresh"],
      ["done", "KEMBALIKAN HEAD"],
    ],
  ),
  "delete-head": synchronized(
    "delete-head",
    [
      ["select", "Node* target = head;"],
      ["head", "head = head->next;"],
      ["remove", "delete target;"],
      ["done", "return head;"],
    ],
    [
      ["select", "target ← HEAD"],
      ["head", "HEAD ← HEAD.next"],
      ["remove", "HAPUS target"],
      ["done", "KEMBALIKAN HEAD"],
    ],
  ),
  "delete-tail": synchronized(
    "delete-tail",
    [
      ["single", "if (head->next == nullptr) { delete head; head = nullptr; }"],
      ["start", "Node* previous = head;"],
      ["walk", "while (previous->next->next != nullptr) previous = previous->next;"],
      ["select", "Node* target = previous->next;"],
      ["disconnect", "previous->next = nullptr;"],
      ["remove", "delete target;"],
      ["done", "return head;"],
    ],
    [
      ["single", "JIKA hanya satu node, hapus dan atur HEAD ← NULL"],
      ["start", "previous ← HEAD"],
      ["walk", "MAJU hingga node sebelum tail"],
      ["select", "target ← previous.next"],
      ["disconnect", "previous.next ← NULL"],
      ["remove", "HAPUS target"],
      ["done", "KEMBALIKAN HEAD"],
    ],
  ),
  "delete-position": synchronized(
    "delete-position",
    [
      ["head", "if (position == 0) { target = head; head = head->next; }"],
      ["start", "Node* previous = head;"],
      ["walk", "for (int i = 0; i < position - 1; ++i) previous = previous->next;"],
      ["select", "Node* target = previous->next;"],
      ["disconnect", "previous->next = target->next;"],
      ["remove", "delete target;"],
      ["done", "return head;"],
    ],
    [
      ["head", "JIKA posisi = 0, pilih HEAD lalu pindahkan HEAD"],
      ["start", "previous ← HEAD"],
      ["walk", "MAJU hingga node sebelum posisi"],
      ["select", "target ← previous.next"],
      ["disconnect", "previous.next ← target.next"],
      ["remove", "HAPUS target"],
      ["done", "KEMBALIKAN HEAD"],
    ],
  ),
};
