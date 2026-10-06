import type { StackOperationKey } from "./types";

export interface StackComplexity {
  readonly best: "O(1)";
  readonly average: "O(1)";
  readonly worst: "O(1)";
  readonly explanation: string;
}

export const stackComplexities: Readonly<Record<StackOperationKey, StackComplexity>> = {
  push: {
    best: "O(1)", average: "O(1)", worst: "O(1)",
    explanation: "Elemen baru ditulis langsung ke slot setelah TOP.",
  },
  pop: {
    best: "O(1)", average: "O(1)", worst: "O(1)",
    explanation: "Hanya elemen TOP yang dibaca lalu dilepas.",
  },
  peek: {
    best: "O(1)", average: "O(1)", worst: "O(1)",
    explanation: "Elemen TOP diakses langsung tanpa mengubah Stack.",
  },
  "is-empty": {
    best: "O(1)", average: "O(1)", worst: "O(1)",
    explanation: "Pemeriksaan cukup membandingkan TOP dengan -1.",
  },
  "is-full": {
    best: "O(1)", average: "O(1)", worst: "O(1)",
    explanation: "Pemeriksaan cukup membandingkan ukuran dengan kapasitas.",
  },
};
