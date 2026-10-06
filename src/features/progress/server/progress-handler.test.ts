import { describe, expect, it, vi } from "vitest";
import { createProgressHandler } from "./progress-handler";

function command(body: unknown) {
  return new Request("http://localhost/api/learning/progress/linked-list/node", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("progress write server boundary", () => {
  it("rejects guest persistence cleanly", async () => {
    const completeLesson = vi.fn();
    const handler = createProgressHandler({
      getAuthenticatedUserId: async () => null,
      startLesson: vi.fn(),
      completeLesson,
    });
    const response = await handler(command({ action: "complete" }), "linked-list", "node");
    expect(response.status).toBe(401);
    expect(completeLesson).not.toHaveBeenCalled();
  });

  it("scopes writes to the server-resolved user", async () => {
    const completeLesson = vi.fn();
    const handler = createProgressHandler({
      getAuthenticatedUserId: async () => "server-user-a",
      startLesson: vi.fn(),
      completeLesson,
    });
    const response = await handler(command({ action: "complete" }), "linked-list", "node");
    expect(response.status).toBe(200);
    expect(completeLesson).toHaveBeenCalledWith("server-user-a", "linked-list", "node");
  });

  it("rejects a client-supplied userId and never writes for another user", async () => {
    const completeLesson = vi.fn();
    const handler = createProgressHandler({
      getAuthenticatedUserId: async () => "server-user-a",
      startLesson: vi.fn(),
      completeLesson,
    });
    const response = await handler(
      command({ action: "complete", userId: "server-user-b" }),
      "linked-list",
      "node",
    );
    expect(response.status).toBe(400);
    expect(completeLesson).not.toHaveBeenCalled();
  });

  it("rejects unknown content without leaking internals", async () => {
    const handler = createProgressHandler({
      getAuthenticatedUserId: async () => "server-user-a",
      startLesson: vi.fn(),
      completeLesson: vi.fn(),
    });
    const response = await handler(
      command({ action: "start" }),
      "linked-list",
      "unknown-lesson",
    );
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "Module atau lesson tidak ditemukan.",
    });
  });
});
