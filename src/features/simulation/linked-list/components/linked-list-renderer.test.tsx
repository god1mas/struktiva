import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createLinkedListState } from "..";
import { visualStates } from "../state";
import { LinkedListRenderer } from "./linked-list-renderer";

describe("LinkedListRenderer", () => {
  it("renders HEAD, values, NULL, and explicit simulated addresses", () => {
    const state = createLinkedListState([10, 20]);
    const { rerender } = render(
      <LinkedListRenderer state={state} visualState={visualStates(state)} view="structure" />,
    );

    expect(screen.getByText("HEAD ↓")).toBeVisible();
    expect(screen.getByText("10")).toBeVisible();
    expect(screen.getAllByText("NULL").length).toBeGreaterThan(0);

    rerender(
      <LinkedListRenderer state={state} visualState={visualStates(state)} view="memory" />,
    );
    expect(screen.getByText("Alamat simulasi: 0xA100")).toBeVisible();
    expect(screen.getByText(/bukan alamat memori nyata/)).toBeVisible();
  });

  it("renders an accessible empty state", () => {
    const state = createLinkedListState([]);
    render(
      <LinkedListRenderer state={state} visualState={visualStates(state)} view="structure" />,
    );

    expect(screen.getByText(/Linked list kosong/)).toBeVisible();
  });
});
