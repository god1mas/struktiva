import { z } from "zod";
import type { ModuleDefinition } from "./types";

const stableSlug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug harus stabil dan menggunakan kebab-case.");

const lessonSchema = z.object({
  slug: stableSlug,
  title: z.string().min(1),
  description: z.string().min(1),
  chapter: z.string().min(1),
  order: z.number().int().positive(),
  countsTowardProgress: z.boolean(),
});

const moduleSchema = z
  .object({
    slug: stableSlug,
    title: z.string().min(1),
    description: z.string().min(1),
    lessons: z.array(lessonSchema).min(1),
    hasQuiz: z.boolean(),
  })
  .superRefine((module, context) => {
    const slugs = module.lessons.map((lesson) => lesson.slug);
    const orders = module.lessons.map((lesson) => lesson.order);
    if (new Set(slugs).size !== slugs.length) {
      context.addIssue({ code: "custom", message: "Slug lesson harus unik dalam module." });
    }
    if (new Set(orders).size !== orders.length) {
      context.addIssue({ code: "custom", message: "Urutan lesson harus unik dalam module." });
    }
  });

export function defineModule(definition: ModuleDefinition): ModuleDefinition {
  const parsed = moduleSchema.parse(definition) as ModuleDefinition;
  return {
    ...parsed,
    lessons: [...parsed.lessons].sort((left, right) => left.order - right.order),
  };
}
