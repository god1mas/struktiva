"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CodePanel } from "../../components/code-panel";
import { PlaybackControls } from "../../components/playback-controls";
import { StepExplanation } from "../../components/step-explanation";
import type { SimulationTrace } from "../../core";
import { useSimulationPlayback } from "../../react/use-simulation-playback";
import {
  createStackState,
  finalState,
  simulateIsEmpty,
  simulateIsFull,
  simulatePeek,
  simulatePop,
  simulatePush,
  stackAlgorithms,
  stackComplexities,
  type StackOperationKey,
  type StackState,
  type StackView,
  type StackVisualState,
} from "..";
import { StackRenderer } from "./stack-renderer";

type StackTrace = SimulationTrace<StackState, StackVisualState>;

const operations: readonly { readonly key: StackOperationKey; readonly label: string }[] = [
  { key: "push", label: "Push" },
  { key: "pop", label: "Pop" },
  { key: "peek", label: "Peek" },
  { key: "is-empty", label: "isEmpty" },
  { key: "is-full", label: "isFull" },
];

function requireInteger(value: string): number {
  if (value.trim() === "") throw new Error("Nilai wajib diisi.");
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error("Nilai harus berupa bilangan bulat.");
  return parsed;
}

export function StackVisualizer() {
  const [currentStack, setCurrentStack] = useState(() => createStackState());
  const [initialTrace] = useState(() => simulateIsEmpty({ state: createStackState() }));
  const [activeOperation, setActiveOperation] = useState<StackOperationKey>("is-empty");
  const [value, setValue] = useState("40");
  const [view, setView] = useState<StackView>("structure");
  const [error, setError] = useState<string | null>(null);
  const committedTrace = useRef<StackTrace | null>(null);
  const playback = useSimulationPlayback(initialTrace);

  useEffect(() => {
    if (
      playback.playback.status === "completed" &&
      committedTrace.current !== playback.playback.trace
    ) {
      setCurrentStack(finalState(playback.playback.trace));
      committedTrace.current = playback.playback.trace;
    }
  }, [playback.playback.status, playback.playback.trace]);

  function loadOperation(operation: StackOperationKey, trace: StackTrace) {
    setActiveOperation(operation);
    setError(null);
    committedTrace.current = null;
    playback.loadTrace(trace);
  }

  function runOperation(operation: StackOperationKey) {
    try {
      let trace: StackTrace;
      switch (operation) {
        case "push":
          trace = simulatePush({ state: currentStack, value: requireInteger(value) });
          break;
        case "pop":
          trace = simulatePop({ state: currentStack });
          break;
        case "peek":
          trace = simulatePeek({ state: currentStack });
          break;
        case "is-empty":
          trace = simulateIsEmpty({ state: currentStack });
          break;
        case "is-full":
          trace = simulateIsFull({ state: currentStack });
          break;
      }
      loadOperation(operation, trace);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Operasi Stack tidak dapat dijalankan.");
    }
  }

  function replaceStack(state: StackState) {
    setCurrentStack(state);
    committedTrace.current = null;
    loadOperation("is-empty", simulateIsEmpty({ state }));
  }

  const isPlaying = playback.playback.status === "playing";
  const complexity = stackComplexities[activeOperation];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-700">
          Interactive visualizer
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Stack Visualizer
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          Pelajari prinsip LIFO pada Stack berbasis Array berkapasitas 8, lengkap dengan TOP, overflow, underflow, dan alamat memori simulasi.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/learn/stack" className="text-blue-700 hover:underline">Lihat kurikulum</Link>
          <Link href="/learn/stack/quiz" className="text-blue-700 hover:underline">Kerjakan quiz →</Link>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.8fr)]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-end gap-3">
              <label className="min-w-52 flex-1 text-sm font-semibold text-slate-700">
                Nilai Push (-99 sampai 999)
                <input
                  type="number"
                  min="-99"
                  max="999"
                  step="1"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  disabled={isPlaying}
                  className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"
                />
              </label>
              <button
                type="button"
                onClick={() => replaceStack(createStackState())}
                disabled={isPlaying}
                className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40"
              >
                Reset 10,20,30
              </button>
              <button
                type="button"
                onClick={() => replaceStack(createStackState([]))}
                disabled={isPlaying}
                className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40"
              >
                Kosongkan
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2" aria-label="Operasi Stack">
              {operations.map((operation) => (
                <button
                  key={operation.key}
                  type="button"
                  onClick={() => runOperation(operation.key)}
                  disabled={isPlaying}
                  aria-pressed={activeOperation === operation.key}
                  className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40 ${
                    activeOperation === operation.key
                      ? "border-blue-700 bg-blue-700 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-blue-400"
                  }`}
                >
                  {operation.label}
                </button>
              ))}
            </div>
            {error ? (
              <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
                {error}
              </p>
            ) : null}
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold text-slate-900">{stackAlgorithms[activeOperation].title}</h2>
            <div className="rounded-lg border border-slate-300 bg-white p-1" aria-label="Mode tampilan Stack">
              {(["structure", "memory"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setView(option)}
                  aria-pressed={view === option}
                  className={`min-h-10 rounded-md px-3 py-1.5 text-sm font-semibold ${
                    view === option ? "bg-slate-900 text-white" : "text-slate-600"
                  }`}
                >
                  {option === "structure" ? "Struktur" : "Memori"}
                </button>
              ))}
            </div>
          </div>

          <StackRenderer
            state={playback.currentFrame.state}
            visualState={playback.currentFrame.visualState}
            view={view}
          />
          <PlaybackControls
            status={playback.playback.status}
            speed={playback.playback.speed}
            currentFrameIndex={playback.playback.currentFrameIndex}
            frameCount={playback.playback.trace.frames.length}
            onPlay={playback.play}
            onPause={playback.pause}
            onPrevious={playback.previous}
            onNext={playback.next}
            onRestart={playback.restart}
            onSpeedChange={playback.setSpeed}
          />
          <StepExplanation
            title={playback.currentFrame.title}
            explanation={playback.currentFrame.explanation}
            currentFrameIndex={playback.playback.currentFrameIndex}
            frameCount={playback.playback.trace.frames.length}
          />
          <section className="rounded-2xl border border-slate-200 bg-white p-5" aria-label="Kompleksitas operasi">
            <h2 className="font-bold">Kompleksitas {stackAlgorithms[activeOperation].title}</h2>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg bg-slate-50 p-2"><dt>Best</dt><dd className="font-black">{complexity.best}</dd></div>
              <div className="rounded-lg bg-slate-50 p-2"><dt>Average</dt><dd className="font-black">{complexity.average}</dd></div>
              <div className="rounded-lg bg-slate-50 p-2"><dt>Worst</dt><dd className="font-black">{complexity.worst}</dd></div>
            </dl>
            <p className="mt-3 text-sm leading-6 text-slate-600">{complexity.explanation}</p>
          </section>
        </div>

        <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
          <CodePanel
            code={stackAlgorithms[activeOperation].code}
            activeCppLineIds={playback.currentFrame.activeCppLineIds}
            activePseudocodeLineIds={playback.currentFrame.activePseudocodeLineIds}
          />
        </aside>
      </div>
    </div>
  );
}
