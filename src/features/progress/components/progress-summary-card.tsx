import type { ModuleLearningProgress } from "../types";

const statusLabels = {
  "not-started": "Belum dimulai",
  "in-progress": "Sedang dipelajari",
  completed: "Selesai",
} as const;

export function ProgressSummaryCard({
  progress,
}: {
  readonly progress: ModuleLearningProgress;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-950">{progress.moduleTitle}</h2>
          <p className="mt-1 text-sm font-semibold text-blue-700">
            {statusLabels[progress.status]}
          </p>
        </div>
        <strong className="text-2xl text-slate-950">{progress.percentage}%</strong>
      </div>
      <progress
        className="mt-4 h-2 w-full accent-blue-700"
        value={progress.percentage}
        max="100"
        aria-label={`Progress ${progress.moduleTitle}: ${progress.percentage}%`}
      />
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Lesson selesai</dt>
          <dd className="font-semibold">{progress.completedLessonCount} / {progress.totalLessonCount}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Lesson terakhir</dt>
          <dd className="font-semibold">{progress.lastLessonTitle ?? "Belum ada"}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Skor quiz terbaik</dt>
          <dd className="font-semibold">{progress.bestQuizScore === null ? "Belum ada" : `${progress.bestQuizScore}`}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Percobaan quiz</dt>
          <dd className="font-semibold">{progress.quizAttemptCount}</dd>
        </div>
      </dl>
    </article>
  );
}
