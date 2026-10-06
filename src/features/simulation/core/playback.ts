import {
  PLAYBACK_SPEEDS,
  type PlaybackSpeed,
  type PlaybackStatus,
} from "./constants";
import type { SimulationFrame, SimulationTrace } from "./trace";
import { SimulationInvariantError } from "./validation";

export interface PlaybackState<State, VisualState> {
  readonly trace: SimulationTrace<State, VisualState>;
  readonly currentFrameIndex: number;
  readonly status: PlaybackStatus;
  readonly speed: PlaybackSpeed;
}

export function isPlaybackSpeed(value: number): value is PlaybackSpeed {
  return (PLAYBACK_SPEEDS as readonly number[]).includes(value);
}

function assertPlaybackSpeed(value: number): asserts value is PlaybackSpeed {
  if (!isPlaybackSpeed(value)) {
    throw new SimulationInvariantError(
      `Unsupported playback speed "${value}"`,
    );
  }
}

function getLastFrameIndex<State, VisualState>(
  state: PlaybackState<State, VisualState>,
) {
  return state.trace.frames.length - 1;
}

export function createPlaybackState<State, VisualState>(
  trace: SimulationTrace<State, VisualState>,
  speed: PlaybackSpeed = 1,
): PlaybackState<State, VisualState> {
  if (trace.frames.length === 0) {
    throw new SimulationInvariantError(
      "Playback requires a trace with at least one frame",
    );
  }

  assertPlaybackSpeed(speed);

  return {
    trace,
    currentFrameIndex: 0,
    status: "idle",
    speed,
  };
}

export function getCurrentFrame<State, VisualState>(
  state: PlaybackState<State, VisualState>,
): SimulationFrame<State, VisualState> {
  const frame = state.trace.frames[state.currentFrameIndex];

  if (!frame) {
    throw new SimulationInvariantError(
      `Playback frame index "${state.currentFrameIndex}" is invalid`,
    );
  }

  return frame;
}

export function nextFrame<State, VisualState>(
  state: PlaybackState<State, VisualState>,
): PlaybackState<State, VisualState> {
  const lastFrameIndex = getLastFrameIndex(state);

  if (state.currentFrameIndex >= lastFrameIndex) {
    return state.status === "completed"
      ? state
      : { ...state, status: "completed" };
  }

  const currentFrameIndex = state.currentFrameIndex + 1;

  return {
    ...state,
    currentFrameIndex,
    status:
      currentFrameIndex === lastFrameIndex
        ? "completed"
        : state.status === "playing"
          ? "playing"
          : "paused",
  };
}

export function previousFrame<State, VisualState>(
  state: PlaybackState<State, VisualState>,
): PlaybackState<State, VisualState> {
  const currentFrameIndex = Math.max(0, state.currentFrameIndex - 1);

  return {
    ...state,
    currentFrameIndex,
    status: currentFrameIndex === 0 ? "idle" : "paused",
  };
}

export function play<State, VisualState>(
  state: PlaybackState<State, VisualState>,
): PlaybackState<State, VisualState> {
  if (state.currentFrameIndex === getLastFrameIndex(state)) {
    return state.status === "completed"
      ? state
      : { ...state, status: "completed" };
  }

  return state.status === "playing"
    ? state
    : { ...state, status: "playing" };
}

export function pause<State, VisualState>(
  state: PlaybackState<State, VisualState>,
): PlaybackState<State, VisualState> {
  return state.status === "playing"
    ? { ...state, status: "paused" }
    : state;
}

export function restart<State, VisualState>(
  state: PlaybackState<State, VisualState>,
): PlaybackState<State, VisualState> {
  return {
    ...state,
    currentFrameIndex: 0,
    status: "idle",
  };
}

export function jumpToFrame<State, VisualState>(
  state: PlaybackState<State, VisualState>,
  frameIndex: number,
): PlaybackState<State, VisualState> {
  const lastFrameIndex = getLastFrameIndex(state);

  if (
    !Number.isInteger(frameIndex) ||
    frameIndex < 0 ||
    frameIndex > lastFrameIndex
  ) {
    throw new SimulationInvariantError(
      `Playback frame index "${frameIndex}" is out of bounds`,
    );
  }

  return {
    ...state,
    currentFrameIndex: frameIndex,
    status:
      frameIndex === 0
        ? "idle"
        : frameIndex === lastFrameIndex
          ? "completed"
          : "paused",
  };
}

export function setPlaybackSpeed<State, VisualState>(
  state: PlaybackState<State, VisualState>,
  speed: number,
): PlaybackState<State, VisualState> {
  assertPlaybackSpeed(speed);

  return speed === state.speed ? state : { ...state, speed };
}
