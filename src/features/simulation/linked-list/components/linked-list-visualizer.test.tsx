import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinkedListVisualizer } from "./linked-list-visualizer";

describe("LinkedListVisualizer", () => {
  it("shows inline validation feedback for an invalid position", () => {
    render(<LinkedListVisualizer />);

    fireEvent.change(screen.getByLabelText(/Posisi/), { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: "Insert Position" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Posisi sisip harus berada di antara 0 dan 3",
    );
  });

  it("moves one step and changes the synchronized explanation", () => {
    render(<LinkedListVisualizer />);

    expect(screen.getByText("Langkah 1 dari 7")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Langkah berikutnya" }));
    expect(screen.getByText("Langkah 2 dari 7")).toBeVisible();
  });
});
