import "server-only";

import { prisma } from "@/lib/prisma";
import { createProgressService } from "./progress-service-core";

const service = createProgressService(prisma);

export const startLesson = service.startLesson;
export const completeLesson = service.completeLesson;
export const getModuleLearningProgress = service.getModuleLearningProgress;
export const getUserLearningProgress = service.getUserLearningProgress;
