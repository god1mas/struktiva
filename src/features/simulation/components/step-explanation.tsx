interface StepExplanationProps {
  readonly title: string;
  readonly explanation: string;
  readonly currentFrameIndex: number;
  readonly frameCount: number;
}

export function StepExplanation({
  title,
  explanation,
  currentFrameIndex,
  frameCount,
}: StepExplanationProps) {
  return (
    <section
      className="rounded-2xl border border-blue-200 bg-blue-50 p-5"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
        Langkah {currentFrameIndex + 1} dari {frameCount}
      </p>
      <h2 className="mt-2 text-lg font-bold text-slate-950">{title}</h2>
      <p className="mt-1 leading-7 text-slate-700">{explanation}</p>
    </section>
  );
}
