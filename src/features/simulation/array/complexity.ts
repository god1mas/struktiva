import type { ArrayOperationKey } from "./types";

export interface ArrayComplexity {
  readonly best: string;
  readonly average: string;
  readonly worst: string;
  readonly explanation: string;
}

export const arrayComplexities: Readonly<Record<ArrayOperationKey, ArrayComplexity>> = {
  access: {
    best: "O(1)", average: "O(1)", worst: "O(1)",
    explanation: "Alamat elemen dihitung langsung dari indeks; tidak perlu traversal.",
  },
  update: {
    best: "O(1)", average: "O(1)", worst: "O(1)",
    explanation: "Elemen pada indeks tujuan diperbarui secara langsung.",
  },
  traversal: {
    best: "O(n)", average: "O(n)", worst: "O(n)",
    explanation: "Setiap elemen dikunjungi satu kali dari indeks 0 hingga n - 1.",
  },
  insert: {
    best: "O(1)", average: "O(n)", worst: "O(n)",
    explanation: "Insert di akhir dapat konstan saat kapasitas tersedia; indeks lain memerlukan pergeseran ke kanan.",
  },
  delete: {
    best: "O(1)", average: "O(n)", worst: "O(n)",
    explanation: "Delete indeks terakhir tidak menggeser; indeks lain memerlukan pergeseran ke kiri.",
  },
};
