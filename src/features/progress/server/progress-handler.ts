import { z } from "zod";
import { ContentNotFoundError, getLessonDefinition } from "@/content";

const progressCommandSchema = z
  .object({ action: z.enum(["start", "complete"]) })
  .strict();

export interface ProgressHandlerDependencies {
  readonly getAuthenticatedUserId: (headers: Headers) => Promise<string | null>;
  readonly startLesson: (
    userId: string,
    moduleSlug: string,
    lessonSlug: string,
  ) => Promise<void>;
  readonly completeLesson: (
    userId: string,
    moduleSlug: string,
    lessonSlug: string,
  ) => Promise<void>;
}

export function createProgressHandler(dependencies: ProgressHandlerDependencies) {
  return async function handleProgress(
    request: Request,
    moduleSlug: string,
    lessonSlug: string,
  ): Promise<Response> {
    try {
      getLessonDefinition(moduleSlug, lessonSlug);
      const userId = await dependencies.getAuthenticatedUserId(request.headers);
      if (!userId) {
        return Response.json(
          { error: "Login diperlukan untuk menyimpan progress." },
          { status: 401 },
        );
      }
      const payload: unknown = await request.json();
      const command = progressCommandSchema.safeParse(payload);
      if (!command.success) {
        return Response.json({ error: "Perintah progress tidak valid." }, { status: 400 });
      }
      if (command.data.action === "start") {
        await dependencies.startLesson(userId, moduleSlug, lessonSlug);
      } else {
        await dependencies.completeLesson(userId, moduleSlug, lessonSlug);
      }
      return Response.json({ saved: true });
    } catch (error) {
      if (error instanceof ContentNotFoundError) {
        return Response.json({ error: "Module atau lesson tidak ditemukan." }, { status: 404 });
      }
      if (error instanceof SyntaxError) {
        return Response.json({ error: "Perintah progress tidak valid." }, { status: 400 });
      }
      console.error("Progress update failed.");
      return Response.json(
        { error: "Progress belum dapat disimpan. Silakan coba lagi." },
        { status: 500 },
      );
    }
  };
}
