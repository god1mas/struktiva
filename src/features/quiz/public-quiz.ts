import type { CanonicalQuiz, PublicQuiz } from "./types";

export function toPublicQuiz(quiz: CanonicalQuiz): PublicQuiz {
  return {
    moduleSlug: quiz.moduleSlug,
    title: quiz.title,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      topicSlug: question.topicSlug,
      prompt: question.prompt,
      options: question.options.map((option) => ({ ...option })),
    })),
  };
}
