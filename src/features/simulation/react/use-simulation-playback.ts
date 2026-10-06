"use client";

import { useCallback, useEffect, useState } from "react";
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
  type PlaybackSpeed,
  type SimulationTrace,
} from "../core";

export const BASE_PLAYBACK_DELAY_MS = 1000;

export function useSimulationPlayback<State, VisualState>(
  initialTrace: SimulationTrace<State, VisualState>,
) {
  const [playback, setPlayback] = useState(() =>
    createPlaybackState(initialTrace),
  );

  useEffect(() => {
    if (playback.status !== "playing") {
      return;
    }

    const timer = window.setTimeout(() => {
      setPlayback((current) => nextFrame(current));
    }, BASE_PLAYBACK_DELAY_MS / playback.speed);

    return () => window.clearTimeout(timer);
  }, [
    playback.currentFrameIndex,
    playback.speed,
    playback.status,
    playback.trace,
  ]);

  const loadTrace = useCallback(
    (trace: SimulationTrace<State, VisualState>) => {
      setPlayback((current) => createPlaybackState(trace, current.speed));
    },
    [],
  );

  const start = useCallback(() => setPlayback((current) => play(current)), []);
  const stop = useCallback(() => setPlayback((current) => pause(current)), []);
  const next = useCallback(
    () => setPlayback((current) => nextFrame(current)),
    [],
  );
  const previous = useCallback(
    () => setPlayback((current) => previousFrame(current)),
    [],
  );
  const reset = useCallback(
    () => setPlayback((current) => restart(current)),
    [],
  );
  const jump = useCallback(
    (frameIndex: number) =>
      setPlayback((current) => jumpToFrame(current, frameIndex)),
    [],
  );
  const setSpeed = useCallback(
    (speed: PlaybackSpeed) =>
      setPlayback((current) => setPlaybackSpeed(current, speed)),
    [],
  );

  return {
    playback,
    currentFrame: getCurrentFrame(playback),
    loadTrace,
    play: start,
    pause: stop,
    next,
    previous,
    restart: reset,
    jump,
    setSpeed,
  };
}
