import { z } from "zod";
import type { CanonicalQuiz, SubmittedAnswer } from "./types";

const answerSchema = z
  .object({
    questionId: z.string().min(1),
    selectedOptionId: z.string().min(1),
  })
  .strict();

const submissionSchema = z
  .object({ answers: z.array(answerSchema).min(1) })
  .strict();

export class QuizSubmissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizSubmissionError";
  }
}

export function validateQuizSubmission(
  quiz: CanonicalQuiz,
  input: unknown,
): readonly SubmittedAnswer[] {
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) {
    throw new QuizSubmissionError("Payload quiz tidak valid.");
  }

  const answers = parsed.data.answers;
  const submittedIds = answers.map((answer) => answer.questionId);
  if (new Set(submittedIds).size !== submittedIds.length) {
    throw new QuizSubmissionError("Setiap pertanyaan hanya boleh dijawab satu kali.");
  }
  if (answers.length !== quiz.questions.length) {
    throw new QuizSubmissionError("Semua pertanyaan wajib dijawab sebelum submit.");
  }

  const answerByQuestion = new Map(answers.map((answer) => [answer.questionId, answer]));
  for (const question of quiz.questions) {
    const answer = answerByQuestion.get(question.id);
    if (!answer) {
      throw new QuizSubmissionError("Semua pertanyaan wajib dijawab sebelum submit.");
    }
    if (!question.options.some((option) => option.id === answer.selectedOptionId)) {
      throw new QuizSubmissionError("Pilihan jawaban tidak valid untuk pertanyaan ini.");
    }
  }

  if (answers.some((answer) => !quiz.questions.some((q) => q.id === answer.questionId))) {
    throw new QuizSubmissionError("Submission memuat pertanyaan yang tidak dikenal.");
  }
  return answers;
}
