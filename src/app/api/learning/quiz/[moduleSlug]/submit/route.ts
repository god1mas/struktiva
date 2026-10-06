import { getSessionFromHeaders } from "@/features/auth/server/session";
import { persistQuizAttempt } from "@/features/quiz/server/quiz-persistence";
import { createQuizSubmissionHandler } from "@/features/quiz/server/submission-handler";

const handleSubmission = createQuizSubmissionHandler({
  getAuthenticatedUserId: async (requestHeaders) =>
    (await getSessionFromHeaders(requestHeaders))?.user.id ?? null,
  persistAttempt: persistQuizAttempt,
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ moduleSlug: string }> },
) {
  const { moduleSlug } = await params;
  return handleSubmission(request, moduleSlug);
}
