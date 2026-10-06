import { getSessionFromHeaders } from "@/features/auth/server/session";
import { createProgressHandler } from "@/features/progress/server/progress-handler";
import {
  completeLesson,
  startLesson,
} from "@/features/progress/server/progress-service";

const handleProgress = createProgressHandler({
  getAuthenticatedUserId: async (requestHeaders) =>
    (await getSessionFromHeaders(requestHeaders))?.user.id ?? null,
  startLesson,
  completeLesson,
});

export async function POST(
  request: Request,
  {
    params,
  }: { params: Promise<{ moduleSlug: string; lessonSlug: string }> },
) {
  const { moduleSlug, lessonSlug } = await params;
  return handleProgress(request, moduleSlug, lessonSlug);
}
