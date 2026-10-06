"use client";

import { useState } from "react";
import type {
  PublicQuiz,
  QuizSubmissionResponse,
} from "../types";

interface QuizRunnerProps {
  readonly quiz: PublicQuiz;
}

export function QuizRunner({ quiz }: QuizRunnerProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Readonly<Record<string, string>>>({});
  const [submission, setSubmission] = useState<QuizSubmissionResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);
  const question = quiz.questions[questionIndex]!;
  const selectedOptionId = answers[question.id];
  const allAnswered = quiz.questions.every((item) => answers[item.id] !== undefined);

  function selectAnswer(optionId: string) {
    setAnswers((current) => ({ ...current, [question.id]: optionId }));
    setError(null);
  }

  async function submitQuiz() {
    if (!allAnswered || status === "submitting") {
      setError("Semua pertanyaan wajib dijawab sebelum submit.");
      return;
    }
    setStatus("submitting");
    setError(null);
    try {
      const response = await fetch(`/api/learning/quiz/${quiz.moduleSlug}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          answers: quiz.questions.map((item) => ({
            questionId: item.id,
            selectedOptionId: answers[item.id],
          })),
        }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof body === "object" && body !== null && "error" in body
            ? String(body.error)
            : "Quiz belum dapat diproses.";
        throw new Error(message);
      }
      setSubmission(body as QuizSubmissionResponse);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Quiz belum dapat diproses.");
    } finally {
      setStatus("idle");
    }
  }

  function retry() {
    setQuestionIndex(0);
    setAnswers({});
    setSubmission(null);
    setError(null);
  }

  if (submission) {
    const mistakes = submission.result.questionResults.filter(
      (item) => !item.isCorrect,
    );
    return (
      <section className="space-y-6" aria-live="polite">
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 text-center sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            Hasil quiz
          </p>
          <p className="mt-3 text-5xl font-black text-slate-950">
            {submission.result.score}
          </p>
          <p className="mt-2 text-slate-700">
            {submission.result.correctAnswers} benar dari {submission.result.totalQuestions} soal
          </p>
          <p className="mt-4 font-semibold text-slate-700">
            {submission.saved
              ? "Hasil tersimpan."
              : "Hasil quiz ini tidak disimpan karena kamu belajar sebagai guest."}
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold">Ringkasan topik</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {submission.result.topicBreakdown.map((topic) => (
              <li key={topic.topicSlug} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <strong>{topic.topicSlug}</strong>: {topic.correctAnswers}/{topic.totalQuestions}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold">Review jawaban</h2>
          {mistakes.length === 0 ? (
            <p className="mt-2 text-emerald-800">Semua jawaban benar.</p>
          ) : (
            <ol className="mt-4 space-y-4">
              {mistakes.map((item) => (
                <li key={item.questionId} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold">{item.prompt}</p>
                  <p className="mt-2 text-sm text-slate-700">
                    Jawabanmu: {item.selectedOption.label}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    Jawaban benar: {item.correctOption.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{item.explanation}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
        <button
          type="button"
          onClick={retry}
          className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Coba lagi
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex items-center justify-between gap-4 text-sm font-semibold text-slate-600">
        <span aria-live="polite">
          Pertanyaan {questionIndex + 1} dari {quiz.questions.length}
        </span>
        <span>{Object.keys(answers).length}/{quiz.questions.length} dijawab</span>
      </div>
      <progress
        className="mt-3 h-2 w-full accent-blue-700"
        value={questionIndex + 1}
        max={quiz.questions.length}
        aria-label="Progress pertanyaan"
      />

      <fieldset className="mt-7">
        <legend className="text-xl font-bold leading-8 text-slate-950">
          {question.prompt}
        </legend>
        <div className="mt-5 grid gap-3">
          {question.options.map((option) => (
            <label
              key={option.id}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${
                selectedOptionId === option.id
                  ? "border-blue-700 bg-blue-50 ring-2 ring-blue-100"
                  : "border-slate-300 hover:border-blue-400"
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={selectedOptionId === option.id}
                onChange={() => selectAnswer(option.id)}
                className="size-4 accent-blue-700"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
          {error}
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}
          disabled={questionIndex === 0 || status === "submitting"}
          className="min-h-11 rounded-xl border border-slate-300 px-5 py-2 font-semibold disabled:opacity-40"
        >
          Sebelumnya
        </button>
        {questionIndex < quiz.questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setQuestionIndex((index) => index + 1)}
            disabled={!selectedOptionId || status === "submitting"}
            className="min-h-11 rounded-xl bg-blue-700 px-5 py-2 font-semibold text-white disabled:opacity-40"
          >
            Berikutnya
          </button>
        ) : (
          <button
            type="button"
            onClick={submitQuiz}
            disabled={!allAnswered || status === "submitting"}
            className="min-h-11 rounded-xl bg-blue-700 px-5 py-2 font-semibold text-white disabled:opacity-40"
          >
            {status === "submitting" ? "Memproses…" : "Submit quiz"}
          </button>
        )}
      </div>
    </section>
  );
}
