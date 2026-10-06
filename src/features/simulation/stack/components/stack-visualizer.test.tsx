import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StackVisualizer } from "./stack-visualizer";

describe("StackVisualizer", () => {
  it("shows the trace-backed Push transition and commits its final state", () => {
    const { container } = render(<StackVisualizer />);
    fireEvent.click(screen.getByRole("button", { name: "Push" }));
    fireEvent.click(screen.getByRole("button", { name: "Langkah berikutnya" }));
    expect(screen.getByRole("heading", { name: "Siapkan elemen" })).toBeVisible();
    expect(container.querySelector('[data-visual-state="new"]')).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Langkah berikutnya" }));
    fireEvent.click(screen.getByRole("button", { name: "Langkah berikutnya" }));
    expect(screen.getByTestId("top-index")).toHaveTextContent("TOP = 3");
    expect(container.querySelector('[data-stack-value="40"][data-top="true"]')).not.toBeNull();
  });

  it("reports underflow inline after clearing", () => {
    render(<StackVisualizer />);
    fireEvent.click(screen.getByRole("button", { name: "Kosongkan" }));
    fireEvent.click(screen.getByRole("button", { name: "Pop" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Stack kosong. Tidak ada elemen TOP yang dapat diambil.",
    );
  });

  it("switches to Memory and shows constant complexity", () => {
    render(<StackVisualizer />);
    fireEvent.click(screen.getByRole("button", { name: "Memori" }));
    expect(screen.getByText("0xC100")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Peek" }));
    expect(screen.getByRole("heading", { name: "Kompleksitas Peek" })).toBeVisible();
    expect(screen.getAllByText("O(1)")).toHaveLength(3);
  });
});
