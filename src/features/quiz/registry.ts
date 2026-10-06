import { arrayQuiz } from "@/content/quizzes/array";
import { linkedListQuiz } from "@/content/quizzes/linked-list";
import { stackQuiz } from "@/content/quizzes/stack";
import { ContentNotFoundError } from "@/content";
import type { CanonicalQuiz } from "./types";

const quizzes = [linkedListQuiz, arrayQuiz, stackQuiz] as const;

export function getCanonicalQuiz(moduleSlug: string): CanonicalQuiz {
  const quiz = quizzes.find((candidate) => candidate.moduleSlug === moduleSlug);
  if (!quiz) {
    throw new ContentNotFoundError(`Quiz untuk module "${moduleSlug}" tidak ditemukan.`);
  }
  return quiz;
}
