export const SEMANTIC_VISUAL_STATES = [
  "normal",
  "active",
  "selected",
  "new",
  "compared",
  "found",
  "removed",
  "muted",
] as const;

export type SemanticVisualState = (typeof SEMANTIC_VISUAL_STATES)[number];

export const PLAYBACK_STATUSES = [
  "idle",
  "playing",
  "paused",
  "completed",
] as const;

export type PlaybackStatus = (typeof PLAYBACK_STATUSES)[number];

export const PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2] as const;

export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];
