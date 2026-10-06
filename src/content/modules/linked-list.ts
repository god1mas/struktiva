import { defineModule } from "../validation";

export const linkedListModule = defineModule({
  slug: "linked-list",
  title: "Linked List",
  description:
    "Pelajari node, pointer, traversal, insertion, deletion, dan karakteristik memori Singly Linked List.",
  hasQuiz: true,
  lessons: [
    { slug: "what-is-linked-list", title: "What is Linked List?", description: "Konsep dasar dan hubungan antar-node.", chapter: "Fundamentals", order: 1, countsTowardProgress: true },
    { slug: "node", title: "Node", description: "Value dan pointer sebagai isi sebuah node.", chapter: "Fundamentals", order: 2, countsTowardProgress: true },
    { slug: "pointer-and-next", title: "Pointer & Next", description: "Cara pointer next menghubungkan node.", chapter: "Fundamentals", order: 3, countsTowardProgress: true },
    { slug: "head", title: "Head", description: "Peran HEAD sebagai titik awal list.", chapter: "Fundamentals", order: 4, countsTowardProgress: true },
    { slug: "null", title: "NULL", description: "Penanda akhir pada Singly Linked List.", chapter: "Fundamentals", order: 5, countsTowardProgress: true },
    { slug: "array-vs-linked-list", title: "Array vs Linked List", description: "Perbedaan layout memori dan operasi dasar.", chapter: "Fundamentals", order: 6, countsTowardProgress: true },
    { slug: "traversal", title: "Traversal", description: "Mengunjungi node dari HEAD hingga NULL.", chapter: "Traversal", order: 7, countsTowardProgress: true },
    { slug: "search", title: "Search", description: "Mencari nilai secara berurutan.", chapter: "Traversal", order: 8, countsTowardProgress: true },
    { slug: "insert-head", title: "Insert Head", description: "Menyisipkan node pada awal list.", chapter: "Insertion", order: 9, countsTowardProgress: true },
    { slug: "insert-tail", title: "Insert Tail", description: "Menyisipkan node setelah tail.", chapter: "Insertion", order: 10, countsTowardProgress: true },
    { slug: "insert-position", title: "Insert Position", description: "Menyisipkan node pada indeks tertentu.", chapter: "Insertion", order: 11, countsTowardProgress: true },
    { slug: "delete-head", title: "Delete Head", description: "Menghapus node pertama dan memindahkan HEAD.", chapter: "Deletion", order: 12, countsTowardProgress: true },
    { slug: "delete-tail", title: "Delete Tail", description: "Menghapus node terakhir dengan aman.", chapter: "Deletion", order: 13, countsTowardProgress: true },
    { slug: "delete-position", title: "Delete Position", description: "Melepas node pada indeks tertentu.", chapter: "Deletion", order: 14, countsTowardProgress: true },
    { slug: "time-complexity", title: "Time Complexity", description: "Menganalisis biaya waktu operasi.", chapter: "Performance", order: 15, countsTowardProgress: true },
    { slug: "space-and-memory", title: "Space & Memory", description: "Overhead pointer dan alokasi node.", chapter: "Performance", order: 16, countsTowardProgress: true },
    { slug: "practice", title: "Practice", description: "Menerapkan operasi melalui visualizer.", chapter: "Final", order: 17, countsTowardProgress: true },
    { slug: "quiz", title: "Quiz", description: "Mengukur pemahaman akhir module.", chapter: "Final", order: 18, countsTowardProgress: true },
  ],
});
