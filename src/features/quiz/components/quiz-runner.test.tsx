import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PublicQuiz, QuizSubmissionResponse } from "../types";
import { QuizRunner } from "./quiz-runner";

const quiz: PublicQuiz = {
  moduleSlug: "sample",
  title: "Sample Quiz",
  questions: [
    {
      id: "question-one",
      topicSlug: "fundamentals",
      prompt: "Pertanyaan pertama?",
      options: [
        { id: "one-a", label: "Pilihan A1" },
        { id: "one-b", label: "Pilihan B1" },
        { id: "one-c", label: "Pilihan C1" },
        { id: "one-d", label: "Pilihan D1" },
      ],
    },
    {
      id: "question-two",
      topicSlug: "pointers",
      prompt: "Pertanyaan kedua?",
      options: [
        { id: "two-a", label: "Pilihan A2" },
        { id: "two-b", label: "Pilihan B2" },
        { id: "two-c", label: "Pilihan C2" },
        { id: "two-d", label: "Pilihan D2" },
      ],
    },
  ],
};

const response: QuizSubmissionResponse = {
  saved: false,
  result: {
    score: 50,
    correctAnswers: 1,
    totalQuestions: 2,
    topicBreakdown: [
      { topicSlug: "fundamentals", correctAnswers: 1, totalQuestions: 1 },
      { topicSlug: "pointers", correctAnswers: 0, totalQuestions: 1 },
    ],
    questionResults: [
      {
        questionId: "question-one",
        topicSlug: "fundamentals",
        prompt: "Pertanyaan pertama?",
        selectedOption: { id: "one-a", label: "Pilihan A1" },
        correctOption: { id: "one-a", label: "Pilihan A1" },
        isCorrect: true,
        explanation: "Penjelasan pertama.",
      },
      {
        questionId: "question-two",
        topicSlug: "pointers",
        prompt: "Pertanyaan kedua?",
        selectedOption: { id: "two-b", label: "Pilihan B2" },
        correctOption: { id: "two-a", label: "Pilihan A2" },
        isCorrect: false,
        explanation: "Penjelasan kedua.",
      },
    ],
  },
};

describe("QuizRunner", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("shows the first question without solution data", () => {
    render(<QuizRunner quiz={quiz} />);
    expect(screen.getByText("Pertanyaan 1 dari 2")).toBeVisible();
    expect(screen.getByText("Pertanyaan pertama?")).toBeVisible();
    expect(screen.queryByText("Jawaban benar:")).not.toBeInTheDocument();
    expect(screen.queryByText("Penjelasan pertama.")).not.toBeInTheDocument();
  });

  it("retains answers through next and previous navigation", () => {
    render(<QuizRunner quiz={quiz} />);
    fireEvent.click(screen.getByLabelText("Pilihan A1"));
    fireEvent.click(screen.getByRole("button", { name: "Berikutnya" }));
    fireEvent.click(screen.getByRole("button", { name: "Sebelumnya" }));
    expect(screen.getByLabelText("Pilihan A1")).toBeChecked();
  });

  it("blocks incomplete submission, submits the minimal payload, and resets on retry", async () => {
    let submittedInit: RequestInit | undefined;
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      submittedInit = init;
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<QuizRunner quiz={quiz} />);

    fireEvent.click(screen.getByLabelText("Pilihan A1"));
    fireEvent.click(screen.getByRole("button", { name: "Berikutnya" }));
    expect(screen.getByRole("button", { name: "Submit quiz" })).toBeDisabled();
    fireEvent.click(screen.getByLabelText("Pilihan B2"));
    fireEvent.click(screen.getByRole("button", { name: "Submit quiz" }));

    await waitFor(() => expect(screen.getByText("Hasil quiz")).toBeVisible());
    expect(screen.getByText(/tidak disimpan.*guest/)).toBeVisible();
    const submittedBody = JSON.parse(String(submittedInit?.body)) as Record<
      string,
      unknown
    >;
    expect(submittedBody).toEqual({
      answers: [
        { questionId: "question-one", selectedOptionId: "one-a" },
        { questionId: "question-two", selectedOptionId: "two-b" },
      ],
    });
    expect(submittedBody).not.toHaveProperty("score");
    expect(submittedBody).not.toHaveProperty("userId");

    fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(screen.getByText("Pertanyaan 1 dari 2")).toBeVisible();
    expect(screen.getByLabelText("Pilihan A1")).not.toBeChecked();
  });
});
