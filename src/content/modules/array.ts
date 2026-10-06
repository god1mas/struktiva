import { defineModule } from "../validation";

export const arrayModule = defineModule({
  slug: "array",
  title: "Array",
  description:
    "Pelajari index zero-based, memori kontigu, akses langsung, traversal, serta shifting saat insert dan delete.",
  hasQuiz: true,
  lessons: [
    { slug: "what-is-array", title: "What is Array?", description: "Mengenal kumpulan elemen berurutan dengan tipe yang sama.", chapter: "Fundamentals", order: 1, countsTowardProgress: true },
    { slug: "index-and-element", title: "Index & Element", description: "Memahami index zero-based dan identitas elemen.", chapter: "Fundamentals", order: 2, countsTowardProgress: true },
    { slug: "contiguous-memory", title: "Contiguous Memory", description: "Menghubungkan index dengan lokasi memori simulasi yang bersebelahan.", chapter: "Fundamentals", order: 3, countsTowardProgress: true },
    { slug: "access", title: "Access", description: "Mengakses nilai langsung melalui index.", chapter: "Operations", order: 4, countsTowardProgress: true },
    { slug: "update", title: "Update", description: "Mengubah nilai tanpa mengganti identitas elemen.", chapter: "Operations", order: 5, countsTowardProgress: true },
    { slug: "traversal", title: "Traversal", description: "Mengunjungi elemen dari index pertama hingga terakhir.", chapter: "Operations", order: 6, countsTowardProgress: true },
    { slug: "insert", title: "Insert", description: "Membuat ruang dengan shifting dari kanan ke kiri.", chapter: "Operations", order: 7, countsTowardProgress: true },
    { slug: "delete", title: "Delete", description: "Menghapus elemen dan menutup ruang dengan shifting ke kiri.", chapter: "Operations", order: 8, countsTowardProgress: true },
    { slug: "time-complexity", title: "Time Complexity", description: "Menganalisis biaya akses, traversal, insert, dan delete.", chapter: "Performance", order: 9, countsTowardProgress: true },
    { slug: "array-vs-linked-list", title: "Array vs Linked List", description: "Membandingkan layout memori dan biaya operasi kedua struktur.", chapter: "Performance", order: 10, countsTowardProgress: true },
    { slug: "practice", title: "Practice", description: "Bereksperimen dengan operasi Array melalui visualizer.", chapter: "Final", order: 11, countsTowardProgress: true },
    { slug: "quiz", title: "Quiz", description: "Mengukur pemahaman akhir module Array.", chapter: "Final", order: 12, countsTowardProgress: true },
  ],
});
