export interface LessonDefinition {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly chapter: string;
  readonly order: number;
  readonly countsTowardProgress: boolean;
}

export interface ModuleDefinition {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly lessons: readonly LessonDefinition[];
  readonly hasQuiz: boolean;
}

export class ContentNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentNotFoundError";
  }
}
