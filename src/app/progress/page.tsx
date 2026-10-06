import type { Metadata } from "next";
import { getCurrentSession } from "@/features/auth/server/session";
import { GuestProgressNotice } from "@/features/progress/components/guest-progress-notice";
import { ProgressSummaryCard } from "@/features/progress/components/progress-summary-card";
import { getUserLearningProgress } from "@/features/progress/server/progress-service";

export const metadata: Metadata = {
  title: "Progress Belajar | Struktiva",
};

export default async function ProgressPage() {
  const session = await getCurrentSession();
  const progress = session ? await getUserLearningProgress(session.user.id) : null;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">Learning history</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Progress belajar</h1>
      </header>
      {progress === null ? (
        <GuestProgressNotice />
      ) : (
        <div className="grid gap-5">
          {progress.map((moduleProgress) => (
            <ProgressSummaryCard key={moduleProgress.moduleSlug} progress={moduleProgress} />
          ))}
        </div>
      )}
    </main>
  );
}
