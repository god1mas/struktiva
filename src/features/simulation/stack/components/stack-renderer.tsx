"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { SemanticVisualState } from "../../core";
import {
  getStackSimulatedAddress,
  topIndex,
  type StackItem,
  type StackState,
  type StackView,
  type StackVisualState,
} from "..";

interface StackRendererProps {
  readonly state: StackState;
  readonly visualState: StackVisualState;
  readonly view: StackView;
}

const stateStyles: Readonly<Record<SemanticVisualState, string>> = {
  normal: "border-slate-300 bg-white",
  active: "border-blue-600 bg-blue-50 ring-2 ring-blue-200",
  selected: "border-violet-600 bg-violet-50 ring-2 ring-violet-200",
  new: "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200",
  compared: "border-amber-600 bg-amber-50 ring-2 ring-amber-200",
  found: "border-emerald-700 bg-emerald-100 ring-2 ring-emerald-300",
  removed: "border-rose-600 bg-rose-50 ring-2 ring-rose-200",
  muted: "border-slate-200 bg-slate-50 opacity-55",
};

const stateLabels: Readonly<Record<SemanticVisualState, string>> = {
  normal: "normal",
  active: "aktif",
  selected: "dipilih",
  new: "baru",
  compared: "dibandingkan",
  found: "ditemukan",
  removed: "dihapus",
  muted: "redup",
};

function StackCell({
  item,
  slot,
  top,
  bottom,
  visual,
  view,
  reduceMotion,
}: {
  readonly item: StackItem;
  readonly slot: number;
  readonly top: boolean;
  readonly bottom: boolean;
  readonly visual: SemanticVisualState;
  readonly view: StackView;
  readonly reduceMotion: boolean;
}) {
  const marker = top && bottom ? "TOP · BOTTOM" : top ? "TOP" : bottom ? "BOTTOM" : null;
  return (
    <motion.div
      layout={!reduceMotion}
      layoutId={reduceMotion ? undefined : item.id}
      initial={reduceMotion ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: reduceMotion ? 0 : 0.22 }}
      className="grid w-full grid-cols-[5rem_minmax(8rem,15rem)_5rem] items-center gap-2"
      data-stack-id={item.id}
      data-stack-index={slot}
      data-stack-value={item.value}
      data-top={top ? "true" : undefined}
      data-visual-state={visual}
      aria-label={`Slot ${slot}, nilai ${item.value}, status ${stateLabels[visual]}${top ? ", TOP" : ""}`}
    >
      <div className="text-right text-xs font-black text-blue-700">{marker}</div>
      <div className={`rounded-xl border-2 text-center shadow-sm ${stateStyles[visual]}`}>
        {view === "memory" ? (
          <div className="grid grid-cols-[1fr_auto] items-center">
            <span className="px-3 py-3 text-xl font-black">{item.value}</span>
            <span className="border-l border-current/15 px-2 py-3 font-mono text-[11px] font-bold text-slate-600">
              {getStackSimulatedAddress(slot)}
            </span>
          </div>
        ) : (
          <div className="px-3 py-3 text-xl font-black">{item.value}</div>
        )}
      </div>
      <div className="text-xs font-bold text-slate-500">slot {slot}</div>
    </motion.div>
  );
}

export function StackRenderer({ state, visualState, view }: StackRendererProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const visualById = new Map(
    visualState.map((entry) => [entry.elementId, entry.state]),
  );
  const displayed = state.items.map((item, slot) => ({ item, slot })).reverse();
  const detached = state.transition?.detachedItems ?? [];

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6"
      aria-label="Visualisasi Stack"
      data-testid="stack-canvas"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-slate-700">
        <span>Ukuran {state.items.length} / Kapasitas {state.capacity}</span>
        <span data-testid="top-index">TOP = {topIndex(state)}</span>
      </div>

      <div className="mx-auto flex min-h-80 max-w-md flex-col justify-end rounded-2xl border-x-4 border-b-4 border-slate-400 bg-white p-3">
        {displayed.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center text-center text-slate-500">
            Stack kosong<br />TOP = -1
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {displayed.map(({ item, slot }) => (
              <StackCell
                key={item.id}
                item={item}
                slot={slot}
                top={slot === state.items.length - 1}
                bottom={slot === 0}
                visual={visualById.get(item.id) ?? "normal"}
                view={view}
                reduceMotion={prefersReducedMotion}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {detached.length > 0 ? (
        <div className="mx-auto mt-4 max-w-md border-t border-dashed border-slate-300 pt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Elemen transisi {state.transition?.kind === "push" ? "masuk" : "keluar"}
          </p>
          {detached.map((item) => (
            <div
              key={item.id}
              data-stack-id={item.id}
              data-stack-value={item.value}
              data-visual-state={visualById.get(item.id) ?? "normal"}
              className={`rounded-xl border-2 px-3 py-3 text-center text-xl font-black ${
                stateStyles[visualById.get(item.id) ?? "normal"]
              }`}
            >
              {item.value}
            </div>
          ))}
        </div>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {view === "memory"
          ? "Alamat memori disimulasikan dari 0xC100 dengan jarak konseptual 4 byte per slot; ini bukan alamat proses nyata."
          : "Elemen disusun vertikal dari BOTTOM ke TOP. TOP diturunkan dari ukuran Stack, bukan disimpan terpisah."}
      </p>
    </section>
  );
}
