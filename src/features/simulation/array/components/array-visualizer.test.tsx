import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArrayVisualizer } from "./array-visualizer";

describe("ArrayVisualizer", () => {
  it("shows specific validation feedback for an invalid index", () => {
    render(<ArrayVisualizer />);
    fireEvent.change(screen.getByLabelText(/Index \(mulai dari 0\)/), {
      target: { value: "8" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Access" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Index harus berada di antara 0 dan 3",
    );
  });

  it("exposes a visible insertion shift frame through shared playback", () => {
    const { container } = render(<ArrayVisualizer />);
    fireEvent.click(screen.getByRole("button", { name: "Insert" }));
    fireEvent.click(screen.getByRole("button", { name: "Langkah berikutnya" }));
    fireEvent.click(screen.getByRole("button", { name: "Langkah berikutnya" }));

    expect(screen.getByRole("heading", { name: "Geser index 3 ke 4" })).toBeVisible();
    expect(container.querySelector('[data-empty-index="3"]')).not.toBeNull();
    expect(container.querySelector('[data-active="true"]')).not.toBeNull();
  });

  it("switches to memory view and updates complexity metadata", () => {
    render(<ArrayVisualizer />);
    fireEvent.click(screen.getByRole("button", { name: "Memori" }));
    expect(screen.getByText("0xB100")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Access" }));
    expect(screen.getByRole("heading", { name: "Kompleksitas Access" })).toBeVisible();
    expect(screen.getAllByText("O(1)")).toHaveLength(3);
  });
});
