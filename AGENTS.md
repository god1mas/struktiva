# Struktiva Agent Rules

- Read the canonical files in `docs/` before significant implementation.
- Do not change the documented architecture without explicit approval.
- Keep simulation algorithms pure and deterministic.
- The simulation core must not import React or run animations.
- Renderers must not contain algorithm logic.
- Keep database access server-only.
- Add dependencies only for a concrete, current need.
- Do not modify unrelated files.
- Never execute user-provided C++ code.
- Never commit secrets or production credentials.
- Verify every task; fix failed checks before continuing.
- Do not silently weaken TypeScript, ESLint, or tests.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
