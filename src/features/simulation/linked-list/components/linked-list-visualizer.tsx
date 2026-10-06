"use client";

import { useEffect, useRef, useState } from "react";
import { CodePanel } from "../../components/code-panel";
import { PlaybackControls } from "../../components/playback-controls";
import { StepExplanation } from "../../components/step-explanation";
import type { SimulationTrace } from "../../core";
import { useSimulationPlayback } from "../../react/use-simulation-playback";
import {
  createLinkedListState,
  finalState,
  linkedListAlgorithms,
  simulateDeleteHead,
  simulateDeletePosition,
  simulateDeleteTail,
  simulateInsertHead,
  simulateInsertPosition,
  simulateInsertTail,
  simulateSearch,
  simulateTraversal,
  type LinkedListOperationKey,
  type LinkedListState,
  type LinkedListView,
  type LinkedListVisualState,
} from "..";
import { LinkedListRenderer } from "./linked-list-renderer";

type LinkedListTrace = SimulationTrace<LinkedListState, LinkedListVisualState>;

const operations: readonly {
  readonly key: LinkedListOperationKey;
  readonly label: string;
}[] = [
  { key: "traversal", label: "Traversal" },
  { key: "search", label: "Search" },
  { key: "insert-head", label: "Insert Head" },
  { key: "insert-tail", label: "Insert Tail" },
  { key: "insert-position", label: "Insert Position" },
  { key: "delete-head", label: "Delete Head" },
  { key: "delete-tail", label: "Delete Tail" },
  { key: "delete-position", label: "Delete Position" },
];

function requireNumber(value: string, label: string): number {
  if (value.trim() === "") {
    throw new Error(`${label} wajib diisi.`);
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error(`${label} harus berupa bilangan bulat.`);
  }
  return parsed;
}

export function LinkedListVisualizer() {
  const [currentList, setCurrentList] = useState(() => createLinkedListState());
  const [initialTrace] = useState(() =>
    simulateTraversal({ state: createLinkedListState() }),
  );
  const [activeOperation, setActiveOperation] =
    useState<LinkedListOperationKey>("traversal");
  const [value, setValue] = useState("40");
  const [position, setPosition] = useState("1");
  const [view, setView] = useState<LinkedListView>("structure");
  const [error, setError] = useState<string | null>(null);
  const committedTrace = useRef<LinkedListTrace | null>(null);
  const playback = useSimulationPlayback(initialTrace);

  useEffect(() => {
    if (
      playback.playback.status === "completed" &&
      committedTrace.current !== playback.playback.trace
    ) {
      setCurrentList(finalState(playback.playback.trace));
      committedTrace.current = playback.playback.trace;
    }
  }, [playback.playback.status, playback.playback.trace]);

  function loadOperation(
    operation: LinkedListOperationKey,
    trace: LinkedListTrace,
  ) {
    setActiveOperation(operation);
    setError(null);
    committedTrace.current = null;
    playback.loadTrace(trace);
  }

  function runOperation(operation: LinkedListOperationKey) {
    try {
      let trace: LinkedListTrace;
      switch (operation) {
        case "traversal":
          trace = simulateTraversal({ state: currentList });
          break;
        case "search":
          trace = simulateSearch({
            state: currentList,
            value: requireNumber(value, "Nilai"),
          });
          break;
        case "insert-head":
          trace = simulateInsertHead({
            state: currentList,
            value: requireNumber(value, "Nilai"),
          });
          break;
        case "insert-tail":
          trace = simulateInsertTail({
            state: currentList,
            value: requireNumber(value, "Nilai"),
          });
          break;
        case "insert-position":
          trace = simulateInsertPosition({
            state: currentList,
            value: requireNumber(value, "Nilai"),
            position: requireNumber(position, "Posisi"),
          });
          break;
        case "delete-head":
          trace = simulateDeleteHead({ state: currentList });
          break;
        case "delete-tail":
          trace = simulateDeleteTail({ state: currentList });
          break;
        case "delete-position":
          trace = simulateDeletePosition({
            state: currentList,
            position: requireNumber(position, "Posisi"),
          });
          break;
      }
      loadOperation(operation, trace);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Operasi tidak dapat dijalankan.",
      );
    }
  }

  function replaceList(state: LinkedListState) {
    setCurrentList(state);
    committedTrace.current = null;
    loadOperation("traversal", simulateTraversal({ state }));
  }

  const isPlaying = playback.playback.status === "playing";
  const code = linkedListAlgorithms[activeOperation].code;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-700">
          Reference visualizer
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Linked List Visualizer
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          Pelajari Singly Linked List: amati HEAD, pointer next, dan identitas
          setiap node saat struktur berubah satu langkah pada satu waktu.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.8fr)]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
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
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Posisi (indeks mulai 0)
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={position}
                  onChange={(event) => setPosition(event.target.value)}
                  disabled={isPlaying}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"
                />
              </label>
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => replaceList(createLinkedListState())}
                  disabled={isPlaying}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40"
                >
                  Reset 10→20→30
                </button>
                <button
                  type="button"
                  onClick={() => replaceList(createLinkedListState([]))}
                  disabled={isPlaying}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40"
                >
                  Kosongkan
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2" aria-label="Operasi linked list">
              {operations.map((operation) => (
                <button
                  key={operation.key}
                  type="button"
                  onClick={() => runOperation(operation.key)}
                  disabled={isPlaying}
                  aria-pressed={activeOperation === operation.key}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-40 ${
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

          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-slate-900">
              {linkedListAlgorithms[activeOperation].title}
            </h2>
            <div className="rounded-lg border border-slate-300 bg-white p-1" aria-label="Mode tampilan">
              {(["structure", "memory"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setView(option)}
                  aria-pressed={view === option}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                    view === option ? "bg-slate-900 text-white" : "text-slate-600"
                  }`}
                >
                  {option === "structure" ? "Struktur" : "Memori"}
                </button>
              ))}
            </div>
          </div>

          <LinkedListRenderer
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
        </div>

        <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
          <CodePanel
            code={code}
            activeCppLineIds={playback.currentFrame.activeCppLineIds}
            activePseudocodeLineIds={
              playback.currentFrame.activePseudocodeLineIds
            }
          />
        </aside>
      </div>
    </div>
  );
}
