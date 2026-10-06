import { defineModule } from "../validation";

export const stackModule = defineModule({
  slug: "stack",
  title: "Stack",
  description:
    "Pelajari struktur LIFO, penanda TOP, operasi Push, Pop, Peek, serta kondisi overflow dan underflow.",
  hasQuiz: true,
  lessons: [
    { slug: "what-is-stack", title: "What is Stack?", description: "Mengenal struktur linear dengan akses dari satu ujung.", chapter: "Fundamentals", order: 1, countsTowardProgress: true },
    { slug: "lifo-principle", title: "LIFO Principle", description: "Memahami elemen terakhir masuk sebagai elemen pertama keluar.", chapter: "Fundamentals", order: 2, countsTowardProgress: true },
    { slug: "top", title: "TOP", description: "Menentukan posisi elemen teratas dan keadaan Stack kosong.", chapter: "Fundamentals", order: 3, countsTowardProgress: true },
    { slug: "push", title: "Push", description: "Menambahkan elemen baru tepat di atas TOP.", chapter: "Operations", order: 4, countsTowardProgress: true },
    { slug: "pop", title: "Pop", description: "Mengambil dan menghapus elemen TOP.", chapter: "Operations", order: 5, countsTowardProgress: true },
    { slug: "peek", title: "Peek", description: "Membaca nilai TOP tanpa mengubah Stack.", chapter: "Operations", order: 6, countsTowardProgress: true },
    { slug: "empty-and-full", title: "Empty & Full", description: "Memeriksa kondisi isEmpty dan isFull pada kapasitas tetap.", chapter: "Operations", order: 7, countsTowardProgress: true },
    { slug: "overflow-and-underflow", title: "Overflow & Underflow", description: "Memahami kegagalan aman saat Stack penuh atau kosong.", chapter: "Performance", order: 8, countsTowardProgress: true },
    { slug: "time-complexity", title: "Time Complexity", description: "Menganalisis mengapa seluruh operasi utama berjalan O(1).", chapter: "Performance", order: 9, countsTowardProgress: true },
    { slug: "practice", title: "Practice", description: "Bereksperimen dengan Stack berkapasitas tetap melalui visualizer.", chapter: "Final", order: 10, countsTowardProgress: true },
    { slug: "quiz", title: "Quiz", description: "Mengukur pemahaman akhir module Stack.", chapter: "Final", order: 11, countsTowardProgress: true },
  ],
});
