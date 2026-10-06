import { arrayModule } from "./modules/array";
import { linkedListModule } from "./modules/linked-list";
import { ContentNotFoundError, type LessonDefinition, type ModuleDefinition } from "./types";

const modules = [linkedListModule, arrayModule] as const;

export function getRegisteredModules(): readonly ModuleDefinition[] {
  return modules;
}

export function getModuleDefinition(moduleSlug: string): ModuleDefinition {
  const learningModule = modules.find((candidate) => candidate.slug === moduleSlug);
  if (!learningModule) {
    throw new ContentNotFoundError(`Module "${moduleSlug}" tidak terdaftar.`);
  }
  return learningModule;
}

export function getLessonDefinition(
  moduleSlug: string,
  lessonSlug: string,
): LessonDefinition {
  const learningModule = getModuleDefinition(moduleSlug);
  const lesson = learningModule.lessons.find((candidate) => candidate.slug === lessonSlug);
  if (!lesson) {
    throw new ContentNotFoundError(
      `Lesson "${lessonSlug}" tidak terdaftar pada module "${moduleSlug}".`,
    );
  }
  return lesson;
}

export function getOrderedLessons(moduleSlug: string): readonly LessonDefinition[] {
  return getModuleDefinition(moduleSlug).lessons;
}

export function getLessonCount(moduleSlug: string): number {
  return getOrderedLessons(moduleSlug).length;
}
