export interface QuizOption {
  readonly id: string;
  readonly label: string;
}

export interface CanonicalQuestion {
  readonly id: string;
  readonly topicSlug: string;
  readonly prompt: string;
  readonly options: readonly [QuizOption, QuizOption, QuizOption, QuizOption];
  readonly correctOptionId: string;
  readonly explanation: string;
}

export interface CanonicalQuiz {
  readonly moduleSlug: string;
  readonly title: string;
  readonly questions: readonly CanonicalQuestion[];
}

export interface PublicQuestion {
  readonly id: string;
  readonly topicSlug: string;
  readonly prompt: string;
  readonly options: readonly QuizOption[];
}

export interface PublicQuiz {
  readonly moduleSlug: string;
  readonly title: string;
  readonly questions: readonly PublicQuestion[];
}

export interface SubmittedAnswer {
  readonly questionId: string;
  readonly selectedOptionId: string;
}

export interface QuestionResult {
  readonly questionId: string;
  readonly topicSlug: string;
  readonly prompt: string;
  readonly selectedOption: QuizOption;
  readonly correctOption: QuizOption;
  readonly isCorrect: boolean;
  readonly explanation: string;
}

export interface TopicResult {
  readonly topicSlug: string;
  readonly correctAnswers: number;
  readonly totalQuestions: number;
}

export interface QuizScoreResult {
  readonly correctAnswers: number;
  readonly totalQuestions: number;
  readonly score: number;
  readonly questionResults: readonly QuestionResult[];
  readonly topicBreakdown: readonly TopicResult[];
}

export interface QuizSubmissionResponse {
  readonly saved: boolean;
  readonly result: QuizScoreResult;
}
