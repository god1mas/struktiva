import type {
  CanonicalQuiz,
  QuizScoreResult,
  SubmittedAnswer,
  TopicResult,
} from "./types";

export function scoreQuiz(
  quiz: CanonicalQuiz,
  answers: readonly SubmittedAnswer[],
): QuizScoreResult {
  const answerByQuestion = new Map(
    answers.map((answer) => [answer.questionId, answer.selectedOptionId]),
  );
  const questionResults = quiz.questions.map((question) => {
    const selectedOptionId = answerByQuestion.get(question.id);
    const selectedOption = question.options.find(
      (option) => option.id === selectedOptionId,
    );
    const correctOption = question.options.find(
      (option) => option.id === question.correctOptionId,
    );
    if (!selectedOption || !correctOption) {
      throw new Error("Quiz harus divalidasi sebelum dinilai.");
    }
    return {
      questionId: question.id,
      topicSlug: question.topicSlug,
      prompt: question.prompt,
      selectedOption,
      correctOption,
      isCorrect: selectedOption.id === correctOption.id,
      explanation: question.explanation,
    };
  });
  const correctAnswers = questionResults.filter((result) => result.isCorrect).length;
  const topics = new Map<string, { correct: number; total: number }>();
  for (const result of questionResults) {
    const current = topics.get(result.topicSlug) ?? { correct: 0, total: 0 };
    topics.set(result.topicSlug, {
      correct: current.correct + (result.isCorrect ? 1 : 0),
      total: current.total + 1,
    });
  }
  const topicBreakdown: TopicResult[] = Array.from(topics, ([topicSlug, result]) => ({
    topicSlug,
    correctAnswers: result.correct,
    totalQuestions: result.total,
  }));

  return {
    correctAnswers,
    totalQuestions: quiz.questions.length,
    score: Math.round((correctAnswers / quiz.questions.length) * 100),
    questionResults,
    topicBreakdown,
  };
}
