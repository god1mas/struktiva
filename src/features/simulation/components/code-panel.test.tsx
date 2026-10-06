import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { linkedListCode } from "../linked-list";
import { CodePanel } from "./code-panel";

describe("CodePanel", () => {
  it("switches tabs and highlights synchronized stable line IDs", () => {
    const code = linkedListCode["insert-head"];
    render(
      <CodePanel
        code={code}
        activeCppLineIds={[code.cpp.lines[0]!.id]}
        activePseudocodeLineIds={[code.pseudocode.lines[0]!.id]}
      />,
    );

    expect(screen.getByText("fresh ← NODE BARU(value)").closest("[data-active]"))
      .toHaveAttribute("data-active", "true");
    fireEvent.click(screen.getByRole("tab", { name: "C++" }));
    expect(screen.getByText("Node* fresh = new Node(value);").closest("[data-active]"))
      .toHaveAttribute("data-active", "true");
  });
});
