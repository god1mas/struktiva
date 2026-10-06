import "server-only";

import { prisma } from "@/lib/prisma";
import { createQuizPersistence } from "./quiz-persistence-core";

export const persistQuizAttempt = createQuizPersistence(prisma);
