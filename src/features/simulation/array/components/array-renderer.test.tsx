import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createArrayState,
  simulateDelete,
  simulateInsert,
  visualStates,
} from "..";
import { ArrayRenderer } from "./array-renderer";

describe("ArrayRenderer", () => {
  it("renders values with zero-based index labels and semantic state", () => {
    const state = createArrayState([10, 20]);
    const visual = visualStates(state, new Map([[state.items[1]!.id, "active"]]));
    render(<ArrayRenderer state={state} visualState={visual} view="structure" />);

    expect(screen.getByText("Index 0")).toBeVisible();
    expect(screen.getByText("Index 1")).toBeVisible();
    expect(screen.getByText("20")).toBeVisible();
    expect(screen.getByLabelText(/Index 1, nilai 20, status aktif/)).toBeVisible();
  });

  it("shows deterministic contiguous simulated addresses", () => {
    const state = createArrayState([10, 20, 30]);
    render(<ArrayRenderer state={state} visualState={visualStates(state)} view="memory" />);

    expect(screen.getByText("0xB100")).toBeVisible();
    expect(screen.getByText("0xB104")).toBeVisible();
    expect(screen.getByText("0xB108")).toBeVisible();
    expect(screen.getByText(/bukan alamat memori proses nyata/)).toBeVisible();
  });

  it("renders insertion gaps and removed elements from trace state", () => {
    const insertTrace = simulateInsert({ state: createArrayState([10, 20, 30]), index: 1, value: 15 });
    const shiftFrame = insertTrace.frames.find((frame) => frame.title === "Geser index 2 ke 3")!;
    const { rerender, container } = render(
      <ArrayRenderer state={shiftFrame.state} visualState={shiftFrame.visualState} view="structure" />,
    );
    expect(container.querySelector('[data-empty-index="2"]')).not.toBeNull();
    expect(screen.getByText("Elemen sementara / dilepas")).toBeVisible();

    const deleteTrace = simulateDelete({ state: createArrayState([10, 20, 30]), index: 1 });
    const detachedFrame = deleteTrace.frames[1]!;
    rerender(
      <ArrayRenderer state={detachedFrame.state} visualState={detachedFrame.visualState} view="structure" />,
    );
    expect(container.querySelector('[data-visual-state="removed"]')).not.toBeNull();
  });

  it("renders an accessible empty state", () => {
    const state = createArrayState([]);
    render(<ArrayRenderer state={state} visualState={visualStates(state)} view="structure" />);
    expect(screen.getByText(/Array kosong/)).toBeVisible();
  });
});
