import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { simulateTraversal, createLinkedListState } from "../linked-list";
import { BASE_PLAYBACK_DELAY_MS, useSimulationPlayback } from "./use-simulation-playback";

function Harness() {
  const simulation = useSimulationPlayback(
    simulateTraversal({ state: createLinkedListState([1, 2]) }),
  );

  return (
    <div>
      <output data-testid="index">{simulation.playback.currentFrameIndex}</output>
      <output data-testid="status">{simulation.playback.status}</output>
      <button onClick={simulation.play}>play</button>
      <button onClick={simulation.pause}>pause</button>
      <button onClick={simulation.restart}>restart</button>
      <button onClick={() => simulation.setSpeed(2)}>speed</button>
    </div>
  );
}

describe("useSimulationPlayback", () => {
  afterEach(() => vi.useRealTimers());

  it("schedules deterministic automatic steps and can pause", () => {
    vi.useFakeTimers();
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "play" }));
    expect(screen.getByTestId("status")).toHaveTextContent("playing");
    act(() => vi.advanceTimersByTime(BASE_PLAYBACK_DELAY_MS));
    expect(screen.getByTestId("index")).toHaveTextContent("1");

    fireEvent.click(screen.getByRole("button", { name: "pause" }));
    act(() => vi.advanceTimersByTime(BASE_PLAYBACK_DELAY_MS * 2));
    expect(screen.getByTestId("index")).toHaveTextContent("1");
  });

  it("applies speed changes and restart without replacing the trace", () => {
    vi.useFakeTimers();
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "speed" }));
    fireEvent.click(screen.getByRole("button", { name: "play" }));
    act(() => vi.advanceTimersByTime(BASE_PLAYBACK_DELAY_MS / 2));
    expect(screen.getByTestId("index")).toHaveTextContent("1");

    fireEvent.click(screen.getByRole("button", { name: "restart" }));
    expect(screen.getByTestId("index")).toHaveTextContent("0");
    expect(screen.getByTestId("status")).toHaveTextContent("idle");
  });

  it("cleans the scheduled timer when unmounted", () => {
    vi.useFakeTimers();
    const clearTimer = vi.spyOn(window, "clearTimeout");
    const view = render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "play" }));
    view.unmount();

    expect(clearTimer).toHaveBeenCalled();
    clearTimer.mockRestore();
  });

  it("stays completed at the final frame instead of restarting", () => {
    vi.useFakeTimers();
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "play" }));
    for (let step = 0; step < 4; step += 1) {
      act(() => vi.advanceTimersByTime(BASE_PLAYBACK_DELAY_MS));
    }
    const finalIndex = screen.getByTestId("index").textContent;

    expect(screen.getByTestId("status")).toHaveTextContent("completed");
    act(() => vi.advanceTimersByTime(BASE_PLAYBACK_DELAY_MS * 10));
    expect(screen.getByTestId("index")).toHaveTextContent(finalIndex ?? "");
    expect(screen.getByTestId("status")).toHaveTextContent("completed");
  });
});
