import { describe, expect, it } from "vitest";
import {
  createPlaybackState,
  getCurrentFrame,
  jumpToFrame,
  nextFrame,
  pause,
  play,
  previousFrame,
  restart,
  setPlaybackSpeed,
  simulationFrameId,
  type PlaybackSpeed,
} from "..";
import { createSyntheticTrace } from "./fixtures/synthetic-simulation";

describe("simulation playback", () => {
  it("starts at the first frame in idle status", () => {
    const state = createPlaybackState(createSyntheticTrace());

    expect(state.currentFrameIndex).toBe(0);
    expect(state.status).toBe("idle");
    expect(state.speed).toBe(1);
    expect(getCurrentFrame(state).id).toBe(simulationFrameId("initial"));
  });

  it("moves next by exactly one frame", () => {
    const state = nextFrame(createPlaybackState(createSyntheticTrace()));

    expect(state.currentFrameIndex).toBe(1);
    expect(state.status).toBe("paused");
  });

  it("does not move next beyond the final frame", () => {
    const initial = createPlaybackState(createSyntheticTrace());
    const completed = nextFrame(nextFrame(initial));

    expect(completed.currentFrameIndex).toBe(2);
    expect(completed.status).toBe("completed");
    expect(nextFrame(completed)).toBe(completed);
  });

  it("moves previous by exactly one frame", () => {
    const initial = createPlaybackState(createSyntheticTrace());
    const state = previousFrame(nextFrame(nextFrame(initial)));

    expect(state.currentFrameIndex).toBe(1);
    expect(state.status).toBe("paused");
  });

  it("does not move previous before the first frame", () => {
    const state = previousFrame(createPlaybackState(createSyntheticTrace()));

    expect(state.currentFrameIndex).toBe(0);
    expect(state.status).toBe("idle");
  });

  it("returns to the exact prior frame after next then previous", () => {
    const initial = createPlaybackState(createSyntheticTrace());
    const frameBeforeNext = getCurrentFrame(initial);
    const restored = previousFrame(nextFrame(initial));

    expect(getCurrentFrame(restored)).toBe(frameBeforeNext);
    expect(getCurrentFrame(restored)).toEqual(frameBeforeNext);
  });

  it("plays only when not at the final frame", () => {
    const initial = createPlaybackState(createSyntheticTrace());
    const playing = play(initial);
    const completed = jumpToFrame(initial, 2);

    expect(playing.status).toBe("playing");
    expect(play(completed)).toBe(completed);
    expect(play(completed).currentFrameIndex).toBe(2);
  });

  it("keeps playing while advancing until completion", () => {
    const playing = play(createPlaybackState(createSyntheticTrace()));
    const middle = nextFrame(playing);
    const completed = nextFrame(middle);

    expect(middle.status).toBe("playing");
    expect(completed.status).toBe("completed");
  });

  it("pauses only from playing status", () => {
    const initial = createPlaybackState(createSyntheticTrace());
    const playing = play(initial);

    expect(pause(playing).status).toBe("paused");
    expect(pause(initial)).toBe(initial);
  });

  it("restarts at the exact first frame and retains speed", () => {
    const initial = createPlaybackState(createSyntheticTrace());
    const firstFrame = getCurrentFrame(initial);
    const configured = setPlaybackSpeed(jumpToFrame(initial, 2), 1.5);
    const restarted = restart(configured);

    expect(restarted.currentFrameIndex).toBe(0);
    expect(restarted.status).toBe("idle");
    expect(restarted.speed).toBe(1.5);
    expect(getCurrentFrame(restarted)).toBe(firstFrame);
  });

  it("jumps to valid frames with deterministic statuses", () => {
    const initial = createPlaybackState(createSyntheticTrace());

    expect(jumpToFrame(initial, 0).status).toBe("idle");
    expect(jumpToFrame(initial, 1).status).toBe("paused");
    expect(jumpToFrame(initial, 2).status).toBe("completed");
  });

  it.each([-1, 3, 1.5])("rejects invalid jump index %s", (frameIndex) => {
    const state = createPlaybackState(createSyntheticTrace());

    expect(() => jumpToFrame(state, frameIndex)).toThrow("out of bounds");
  });

  it.each([0.5, 1, 1.5, 2] satisfies PlaybackSpeed[])(
    "sets supported speed %s",
    (speed) => {
      const state = setPlaybackSpeed(
        createPlaybackState(createSyntheticTrace()),
        speed,
      );

      expect(state.speed).toBe(speed);
    },
  );

  it.each([0, 0.75, 3, Number.NaN])(
    "rejects unsupported speed %s",
    (speed) => {
      const state = createPlaybackState(createSyntheticTrace());

      expect(() => setPlaybackSpeed(state, speed)).toThrow(
        "Unsupported playback speed",
      );
    },
  );

  it("does not mutate the trace, frames, logical state, or visual state", () => {
    const trace = createSyntheticTrace();
    const before = structuredClone(trace);
    let playback = createPlaybackState(trace);

    playback = play(playback);
    playback = nextFrame(playback);
    playback = pause(playback);
    playback = nextFrame(playback);
    playback = previousFrame(playback);
    playback = restart(playback);
    playback = setPlaybackSpeed(playback, 2);

    expect(trace).toEqual(before);
    expect(playback.trace).toBe(trace);
  });
});
