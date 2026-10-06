import { z } from "zod";
import type { CanonicalQuiz } from "./types";

const idSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ID quiz harus menggunakan kebab-case.");

const optionSchema = z.object({ id: idSchema, label: z.string().min(1) });

const questionSchema = z
  .object({
    id: idSchema,
    topicSlug: idSchema,
    prompt: z.string().min(1),
    options: z.array(optionSchema).length(4),
    correctOptionId: idSchema,
    explanation: z.string().min(1),
  })
  .superRefine((question, context) => {
    const optionIds = question.options.map((option) => option.id);
    if (new Set(optionIds).size !== optionIds.length) {
      context.addIssue({ code: "custom", message: "Option ID harus unik per pertanyaan." });
    }
    if (!optionIds.includes(question.correctOptionId)) {
      context.addIssue({ code: "custom", message: "Correct option harus tersedia di options." });
    }
  });

const quizSchema = z
  .object({
    moduleSlug: idSchema,
    title: z.string().min(1),
    questions: z.array(questionSchema).min(1),
  })
  .superRefine((quiz, context) => {
    const questionIds = quiz.questions.map((question) => question.id);
    if (new Set(questionIds).size !== questionIds.length) {
      context.addIssue({ code: "custom", message: "Question ID harus unik." });
    }
  });

export function defineQuiz(definition: CanonicalQuiz): CanonicalQuiz {
  return quizSchema.parse(definition) as unknown as CanonicalQuiz;
}
