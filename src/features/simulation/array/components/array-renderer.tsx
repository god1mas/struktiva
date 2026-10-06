"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { SemanticVisualState, StableElementId } from "../../core";
import {
  getArraySimulatedAddress,
  getRenderableItems,
  type ArrayItem,
  type ArrayState,
  type ArrayView,
  type ArrayVisualState,
} from "..";

interface ArrayRendererProps {
  readonly state: ArrayState;
  readonly visualState: ArrayVisualState;
  readonly view: ArrayView;
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
  muted: "sudah dikunjungi",
};

function ArrayCell({
  item,
  index,
  visual,
  view,
  reduceMotion,
}: {
  readonly item: ArrayItem;
  readonly index: number;
  readonly visual: SemanticVisualState;
  readonly view: ArrayView;
  readonly reduceMotion: boolean;
}) {
  return (
    <motion.div
      layout={!reduceMotion}
      layoutId={reduceMotion ? undefined : item.id}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.22 }}
      className="w-24 shrink-0"
      data-array-id={item.id}
      data-array-index={index}
      data-array-value={item.value}
      data-visual-state={visual}
      aria-label={`Index ${index}, nilai ${item.value}, status ${stateLabels[visual]}`}
    >
      <div className="mb-1 text-center text-xs font-bold text-slate-600">
        Index {index}
      </div>
      <div className={`rounded-xl border-2 text-center shadow-sm ${stateStyles[visual]}`}>
        {view === "memory" ? (
          <>
            <div className="border-b border-current/15 px-1 py-1.5 font-mono text-[11px] font-bold text-slate-600">
              {getArraySimulatedAddress(index)}
            </div>
            <div className="px-3 py-4 text-lg font-black">{item.value}</div>
          </>
        ) : (
          <div className="px-3 py-5 text-xl font-black">{item.value}</div>
        )}
      </div>
      {visual !== "normal" ? (
        <div className="mt-1 text-center text-[11px] font-bold text-slate-600">
          {stateLabels[visual]}
        </div>
      ) : null}
    </motion.div>
  );
}

export function ArrayRenderer({ state, visualState, view }: ArrayRendererProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const items = getRenderableItems(state);
  const itemById = new Map(items.map((item) => [item.id, item]));
  const visualById = new Map(
    visualState.map((entry) => [entry.elementId, entry.state]),
  );
  const placements = state.transition?.placements ??
    state.items.map((item, index) => ({ itemId: item.id, index }));
  const placementByIndex = new Map(
    placements.map((placement) => [placement.index, placement.itemId]),
  );
  const placedIds = new Set(placements.map((placement) => placement.itemId));
  const detached = items.filter((item) => !placedIds.has(item.id));
  const highestIndex = placements.reduce(
    (highest, placement) => Math.max(highest, placement.index),
    -1,
  );
  const slotCount = Math.max(
    highestIndex + 1,
    state.transition?.kind === "insert" ? state.items.length + 1 : state.items.length,
  );

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6"
      aria-label="Visualisasi Array"
      data-testid="array-canvas"
    >
      <div className="overflow-x-auto pb-3">
        {slotCount === 0 ? (
          <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-center text-slate-500">
            Array kosong<br />Insert pada index 0 untuk menambahkan elemen
          </div>
        ) : (
          <div className="flex min-h-36 min-w-max items-center gap-2 pr-4">
            <AnimatePresence initial={false}>
              {Array.from({ length: slotCount }, (_, index) => {
                const itemId = placementByIndex.get(index);
                const item = itemId ? itemById.get(itemId) : undefined;
                return item ? (
                  <ArrayCell
                    key={item.id}
                    item={item}
                    index={index}
                    visual={visualById.get(item.id as StableElementId) ?? "normal"}
                    view={view}
                    reduceMotion={prefersReducedMotion}
                  />
                ) : (
                  <div
                    key={`empty-${index}`}
                    data-empty-index={index}
                    className="w-24 shrink-0"
                    aria-label={`Index ${index} kosong sementara`}
                  >
                    <div className="mb-1 text-center text-xs font-bold text-slate-500">
                      Index {index}
                    </div>
                    <div className="rounded-xl border-2 border-dashed border-slate-300 px-3 py-5 text-center text-slate-400">
                      kosong
                    </div>
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {detached.length > 0 ? (
        <div className="mt-4 border-t border-dashed border-slate-300 pt-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            Elemen sementara / dilepas
          </p>
          <div className="flex min-w-max gap-3 overflow-x-auto pb-2">
            {detached.map((item) => (
              <div key={item.id} className="w-24 shrink-0 text-center">
                <div
                  data-array-id={item.id}
                  data-array-value={item.value}
                  data-visual-state={visualById.get(item.id) ?? "normal"}
                  className={`rounded-xl border-2 px-3 py-4 font-black ${
                    stateStyles[visualById.get(item.id) ?? "normal"]
                  }`}
                >
                  {item.value}
                </div>
                <span className="mt-1 block text-[11px] font-bold text-slate-600">
                  {stateLabels[visualById.get(item.id) ?? "normal"]}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {view === "memory"
          ? "Alamat simulasi dimulai dari 0xB100 dengan jarak konseptual 4 byte; ini bukan alamat memori proses nyata."
          : "Index bersifat zero-based. ID elemen tetap stabil walau insert atau delete menggeser index."}
      </p>
    </section>
  );
}
