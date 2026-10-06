# Learning Progress and Quiz Infrastructure

Phase 7 adds reusable learning metadata, progress persistence, and secure quiz
submission. Linked List is the only registered reference module; its manifest
contains 18 stable lesson slugs grouped into Fundamentals, Traversal, Insertion,
Deletion, Performance, and Final chapters. Static lesson and quiz content stays
in source control rather than the database.

## Content and progress

The registry resolves modules and lessons by stable kebab-case slugs. Display
titles are never persistence keys. Progress percentages are derived from unique
completed, progress-counting lessons and are not stored. A summary also derives
status, completed and total counts, last registered lesson, best quiz score,
and attempt count.

Authenticated `startLesson` and `completeLesson` operations are scoped to the
user resolved from the Better Auth server session. Compound database constraints
make lesson and module writes idempotent. Starting a lesson preserves existing
completion. Completing a lesson preserves its original start and completion
timestamps; module completion is set when every currently registered counting
lesson is complete, and returns to incomplete if the manifest later adds an
unfinished counting lesson.

Guests can use all learning and quiz experiences, but Phase 7 creates no guest
users, sessions, localStorage history, or database progress.

## Quiz security boundary

Canonical questions contain a stable question ID, topic, prompt, exactly four
stable options, one correct option ID, and an explanation. Definitions are
validated once when imported. The public serializer includes only question and
option data; correct IDs, correctness flags, and explanations are absent from
the initial browser payload.

The browser submits only question IDs and selected option IDs. The server
rejects missing, duplicate, extra, unknown, or mismatched answers, resolves the
canonical quiz, and calculates the integer `0..100` score with `Math.round`.
Only after submission does the response include answer review and explanations.

Guest submissions return a result without a database write. Authenticated
submissions resolve ownership from the validated server session and atomically
create a new `QuizAttempt` plus its `QuizAnswer` rows. Retakes always create new
attempts; best score and attempt count are derived from history. Client payloads
cannot choose a user or score.

## Server and UI boundaries

Better Auth and Prisma adapters remain server-only. Testable application
factories accept explicit persistence/session dependencies, while guarded app
adapters bind the production Prisma client. `/learn/linked-list` renders the
manifest, `/learn/linked-list/quiz` passes only public quiz data to the client
runner, and `/progress` renders guest guidance or authenticated summaries.
