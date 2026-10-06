import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GuestProgressNotice } from "./guest-progress-notice";
import { ProgressSummaryCard } from "./progress-summary-card";

describe("progress UI", () => {
  it("explains guest persistence behavior", () => {
    render(<GuestProgressNotice />);
    expect(screen.getByRole("heading", { name: "Belajar sebagai guest" })).toBeVisible();
    expect(screen.getByText(/tidak disimpan/)).toBeVisible();
  });

  it("renders a complete authenticated summary from supplied derived data", () => {
    render(
      <ProgressSummaryCard
        progress={{
          moduleSlug: "linked-list",
          moduleTitle: "Linked List",
          status: "in-progress",
          completedLessonCount: 6,
          totalLessonCount: 18,
          percentage: 33,
          lastLessonSlug: "pointer-and-next",
          lastLessonTitle: "Pointer & Next",
          bestQuizScore: 90,
          quizAttemptCount: 2,
        }}
      />,
    );
    expect(screen.getByText("6 / 18")).toBeVisible();
    expect(screen.getByText("33%")).toBeVisible();
    expect(screen.getByText("Pointer & Next")).toBeVisible();
    expect(screen.getByLabelText("Progress Linked List: 33%")).toBeVisible();
  });
});
