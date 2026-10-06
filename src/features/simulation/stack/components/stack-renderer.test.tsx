import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createStackState,
  simulatePop,
  simulatePush,
  visualStates,
} from "..";
import { StackRenderer } from "./stack-renderer";

describe("StackRenderer", () => {
  it("renders a vertical Stack with TOP, BOTTOM, size, and capacity", () => {
    const state = createStackState([10, 20, 30]);
    render(<StackRenderer state={state} visualState={visualStates(state)} view="structure" />);
    expect(screen.getByText("Ukuran 3 / Kapasitas 8")).toBeVisible();
    expect(screen.getByTestId("top-index")).toHaveTextContent("TOP = 2");
    expect(screen.getByText("TOP")).toBeVisible();
    expect(screen.getByText("BOTTOM")).toBeVisible();
    expect(screen.getByLabelText(/Slot 2, nilai 30.*TOP/)).toBeVisible();
  });

  it("shows deterministic simulated addresses in Memory view", () => {
    const state = createStackState([10, 20, 30]);
    render(<StackRenderer state={state} visualState={visualStates(state)} view="memory" />);
    expect(screen.getByText("0xC100")).toBeVisible();
    expect(screen.getByText("0xC104")).toBeVisible();
    expect(screen.getByText("0xC108")).toBeVisible();
    expect(screen.getByText(/bukan alamat proses nyata/)).toBeVisible();
  });

  it("renders trace-backed incoming and outgoing transition items", () => {
    const pushFrame = simulatePush({ state: createStackState([10]), value: 20 }).frames[1]!;
    const { rerender, container } = render(
      <StackRenderer state={pushFrame.state} visualState={pushFrame.visualState} view="structure" />,
    );
    expect(screen.getByText("Elemen transisi masuk")).toBeVisible();
    expect(container.querySelector('[data-visual-state="new"]')).not.toBeNull();

    const popFrame = simulatePop({ state: createStackState([10, 20]) }).frames[2]!;
    rerender(<StackRenderer state={popFrame.state} visualState={popFrame.visualState} view="structure" />);
    expect(screen.getByText("Elemen transisi keluar")).toBeVisible();
    expect(container.querySelector('[data-visual-state="removed"]')).not.toBeNull();
  });

  it("renders the pedagogical empty state with TOP -1", () => {
    const state = createStackState([]);
    render(<StackRenderer state={state} visualState={visualStates(state)} view="structure" />);
    expect(screen.getByText(/Stack kosong/)).toBeVisible();
    expect(screen.getAllByText(/TOP = -1/).length).toBeGreaterThanOrEqual(1);
  });
});
