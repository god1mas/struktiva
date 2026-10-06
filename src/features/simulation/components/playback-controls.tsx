import type { PlaybackSpeed, PlaybackStatus } from "../core";

interface PlaybackControlsProps {
  readonly status: PlaybackStatus;
  readonly speed: PlaybackSpeed;
  readonly currentFrameIndex: number;
  readonly frameCount: number;
  readonly onPlay: () => void;
  readonly onPause: () => void;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly onRestart: () => void;
  readonly onSpeedChange: (speed: PlaybackSpeed) => void;
}

const speeds = [0.5, 1, 1.5, 2] as const;

export function PlaybackControls({
  status,
  speed,
  currentFrameIndex,
  frameCount,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onRestart,
  onSpeedChange,
}: PlaybackControlsProps) {
  const atStart = currentFrameIndex === 0;
  const atEnd = currentFrameIndex === frameCount - 1;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Kontrol playback">
      <button
        type="button"
        onClick={onRestart}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-40"
        disabled={atStart && status === "idle"}
      >
        Mulai ulang
      </button>
      <button
        type="button"
        onClick={onPrevious}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-40"
        disabled={atStart}
        aria-label="Langkah sebelumnya"
      >
        ← Sebelumnya
      </button>
      {status === "playing" ? (
        <button
          type="button"
          onClick={onPause}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Jeda
        </button>
      ) : (
        <button
          type="button"
          onClick={onPlay}
          disabled={atEnd}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-40"
        >
          Putar
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-40"
        disabled={atEnd}
        aria-label="Langkah berikutnya"
      >
        Berikutnya →
      </button>
      <label className="ml-auto flex items-center gap-2 text-sm font-medium text-slate-700">
        Kecepatan
        <select
          value={speed}
          onChange={(event) =>
            onSpeedChange(Number(event.target.value) as PlaybackSpeed)
          }
          className="rounded-lg border border-slate-300 bg-white px-2 py-2"
          aria-label="Kecepatan playback"
        >
          {speeds.map((option) => (
            <option key={option} value={option}>
              {option}×
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
