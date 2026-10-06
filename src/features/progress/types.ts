export type LearningProgressStatus = "not-started" | "in-progress" | "completed";

export interface LessonProgressRecord {
  readonly lessonSlug: string;
  readonly completedAt: Date | null;
}

export interface QuizAttemptRecord {
  readonly score: number;
}

export interface ModuleProgressInput {
  readonly moduleSlug: string;
  readonly lessonProgress: readonly LessonProgressRecord[];
  readonly lastLessonSlug: string | null;
  readonly quizAttempts: readonly QuizAttemptRecord[];
}

export interface ModuleLearningProgress {
  readonly moduleSlug: string;
  readonly moduleTitle: string;
  readonly status: LearningProgressStatus;
  readonly completedLessonCount: number;
  readonly totalLessonCount: number;
  readonly percentage: number;
  readonly lastLessonSlug: string | null;
  readonly lastLessonTitle: string | null;
  readonly bestQuizScore: number | null;
  readonly quizAttemptCount: number;
}
