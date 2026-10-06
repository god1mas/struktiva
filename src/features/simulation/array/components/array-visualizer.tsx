"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CodePanel } from "../../components/code-panel";
import { PlaybackControls } from "../../components/playback-controls";
import { StepExplanation } from "../../components/step-explanation";
import type { SimulationTrace } from "../../core";
import { useSimulationPlayback } from "../../react/use-simulation-playback";
import {
  arrayAlgorithms,
  arrayComplexities,
  createArrayState,
  finalState,
  simulateAccess,
  simulateDelete,
  simulateInsert,
  simulateTraversal,
  simulateUpdate,
  type ArrayOperationKey,
  type ArrayState,
  type ArrayView,
  type ArrayVisualState,
} from "..";
import { ArrayRenderer } from "./array-renderer";

type ArrayTrace = SimulationTrace<ArrayState, ArrayVisualState>;

const operations: readonly { readonly key: ArrayOperationKey; readonly label: string }[] = [
  { key: "access", label: "Access" },
  { key: "update", label: "Update" },
  { key: "traversal", label: "Traversal" },
  { key: "insert", label: "Insert" },
  { key: "delete", label: "Delete" },
];

function requireInteger(value: string, label: string): number {
  if (value.trim() === "") throw new Error(`${label} wajib diisi.`);
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error(`${label} harus berupa bilangan bulat.`);
  return parsed;
}

export function ArrayVisualizer() {
  const [currentArray, setCurrentArray] = useState(() => createArrayState());
  const [initialTrace] = useState(() => simulateTraversal({ state: createArrayState() }));
  const [activeOperation, setActiveOperation] = useState<ArrayOperationKey>("traversal");
  const [index, setIndex] = useState("1");
  const [value, setValue] = useState("15");
  const [view, setView] = useState<ArrayView>("structure");
  const [error, setError] = useState<string | null>(null);
  const committedTrace = useRef<ArrayTrace | null>(null);
  const playback = useSimulationPlayback(initialTrace);

  useEffect(() => {
    if (
      playback.playback.status === "completed" &&
      committedTrace.current !== playback.playback.trace
    ) {
      setCurrentArray(finalState(playback.playback.trace));
      committedTrace.current = playback.playback.trace;
    }
  }, [playback.playback.status, playback.playback.trace]);

  function loadOperation(operation: ArrayOperationKey, trace: ArrayTrace) {
    setActiveOperation(operation);
    setError(null);
    committedTrace.current = null;
    playback.loadTrace(trace);
  }

  function runOperation(operation: ArrayOperationKey) {
    try {
      const parsedIndex = operation === "traversal"
        ? 0
        : requireInteger(index, "Index");
      let trace: ArrayTrace;
      switch (operation) {
        case "access":
          trace = simulateAccess({ state: currentArray, index: parsedIndex });
          break;
        case "update":
          trace = simulateUpdate({
            state: currentArray,
            index: parsedIndex,
            value: requireInteger(value, "Nilai"),
          });
          break;
        case "traversal":
          trace = simulateTraversal({ state: currentArray });
          break;
        case "insert":
          trace = simulateInsert({
            state: currentArray,
            index: parsedIndex,
            value: requireInteger(value, "Nilai"),
          });
          break;
        case "delete":
          trace = simulateDelete({ state: currentArray, index: parsedIndex });
          break;
      }
      loadOperation(operation, trace);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Operasi Array tidak dapat dijalankan.");
    }
  }

  function replaceArray(state: ArrayState) {
    setCurrentArray(state);
    committedTrace.current = null;
    loadOperation("traversal", simulateTraversal({ state }));
  }

  const isPlaying = playback.playback.status === "playing";
  const complexity = arrayComplexities[activeOperation];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-700">
          Interactive visualizer
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Array Visualizer
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          Pelajari akses langsung, traversal, dan pergeseran elemen pada Array zero-based dengan struktur serta alamat memori simulasi yang sinkron.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/learn/array" className="text-blue-700 hover:underline">Lihat kurikulum</Link>
          <Link href="/learn/array/quiz" className="text-blue-700 hover:underline">Kerjakan quiz →</Link>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.8fr)]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
              <label className="text-sm font-semibold text-slate-700">
                Index (mulai dari 0)
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={index}
                  onChange={(event) => setIndex(event.target.value)}
                  disabled={isPlaying}
                  className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Nilai (-99 sampai 999)
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
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => replaceArray(createArrayState())}
                  disabled={isPlaying}
                  className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40"
                >
                  Reset 10,20,30,40
                </button>
                <button
                  type="button"
                  onClick={() => replaceArray(createArrayState([]))}
                  disabled={isPlaying}
                  className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40"
                >
                  Kosongkan
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2" aria-label="Operasi Array">
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
            <h2 className="font-bold text-slate-900">{arrayAlgorithms[activeOperation].title}</h2>
            <div className="rounded-lg border border-slate-300 bg-white p-1" aria-label="Mode tampilan Array">
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

          <ArrayRenderer
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
            <h2 className="font-bold">Kompleksitas {arrayAlgorithms[activeOperation].title}</h2>
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
            code={arrayAlgorithms[activeOperation].code}
            activeCppLineIds={playback.currentFrame.activeCppLineIds}
            activePseudocodeLineIds={playback.currentFrame.activePseudocodeLineIds}
          />
        </aside>
      </div>
    </div>
  );
}
