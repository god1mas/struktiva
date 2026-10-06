import type { Metadata } from "next";
import Link from "next/link";
import { QuizRunner } from "@/features/quiz/components/quiz-runner";
import { getCanonicalQuiz, toPublicQuiz } from "@/features/quiz";

export const metadata: Metadata = {
  title: "Quiz Array | Struktiva",
  description: "Quiz akhir Array dengan penilaian aman di server.",
};

export default function ArrayQuizPage() {
  const publicQuiz = toPublicQuiz(getCanonicalQuiz("array"));
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <Link href="/learn/array" className="text-sm font-semibold text-blue-700 hover:underline">← Kembali ke module</Link>
      <header className="mb-7 mt-5">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">Final assessment</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{publicQuiz.title}</h1>
        <p className="mt-3 leading-7 text-slate-600">Jawab seluruh pertanyaan. Penilaian dan answer key tetap berada di server sampai quiz disubmit.</p>
      </header>
      <QuizRunner quiz={publicQuiz} />
    </main>
  );
}
