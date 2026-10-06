import type { Metadata } from "next";
import Link from "next/link";
import { getModuleDefinition } from "@/content";

export const metadata: Metadata = {
  title: "Belajar Stack | Struktiva",
  description: "Struktur pembelajaran Stack di Struktiva.",
};

export default function StackModulePage() {
  const learningModule = getModuleDefinition("stack");
  const chapters = Array.from(new Set(learningModule.lessons.map((lesson) => lesson.chapter)));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">Learning module</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Stack</h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-600">{learningModule.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/visualizer/stack" className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">Buka visualizer</Link>
          <Link href="/learn/stack/quiz" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-50">Mulai quiz</Link>
        </div>
      </header>

      <section className="mt-8" aria-labelledby="stack-curriculum-heading">
        <h2 id="stack-curriculum-heading" className="text-2xl font-bold">Kurikulum — {learningModule.lessons.length} lesson</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {chapters.map((chapter) => (
            <section key={chapter} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-bold text-blue-800">{chapter}</h3>
              <ol className="mt-3 space-y-3">
                {learningModule.lessons.filter((lesson) => lesson.chapter === chapter).map((lesson) => (
                  <li key={lesson.slug} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">{lesson.order}</span>
                    <div>
                      {lesson.slug === "quiz" ? (
                        <Link href="/learn/stack/quiz" className="font-semibold text-blue-700 hover:underline">{lesson.title}</Link>
                      ) : lesson.slug === "practice" ? (
                        <Link href="/visualizer/stack" className="font-semibold text-blue-700 hover:underline">{lesson.title}</Link>
                      ) : (
                        <p className="font-semibold">{lesson.title}</p>
                      )}
                      <p className="mt-0.5 text-sm text-slate-600">{lesson.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
