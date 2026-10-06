"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { SemanticVisualState, StableElementId } from "../../core";
import {
  getOrderedNodes,
  getSimulatedAddress,
  type LinkedListNode,
  type LinkedListState,
  type LinkedListView,
  type LinkedListVisualState,
} from "..";

interface LinkedListRendererProps {
  readonly state: LinkedListState;
  readonly visualState: LinkedListVisualState;
  readonly view: LinkedListView;
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
  muted: "sudah dilewati",
};

function Arrow() {
  return (
    <span className="flex shrink-0 items-center text-slate-500" aria-label="menunjuk ke">
      <svg width="42" height="20" viewBox="0 0 42 20" aria-hidden="true">
        <path d="M1 10h36M30 3l8 7-8 7" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </span>
  );
}

function NodeCard({
  node,
  visual,
  view,
  isHead,
  reduceMotion,
}: {
  readonly node: LinkedListNode;
  readonly visual: SemanticVisualState;
  readonly view: LinkedListView;
  readonly isHead: boolean;
  readonly reduceMotion: boolean;
}) {
  const nextLabel = node.nextId === null ? "NULL" : getSimulatedAddress(node.nextId);

  return (
    <motion.div
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: reduceMotion ? 0 : 0.22 }}
      data-node-value={node.value}
      data-node-id={node.id}
      data-visual-state={visual}
      className="relative shrink-0 pt-7"
    >
      {isHead ? (
        <span className="absolute left-1/2 top-0 -translate-x-1/2 text-xs font-black tracking-wider text-blue-700">
          HEAD ↓
        </span>
      ) : null}
      <div
        className={`overflow-hidden rounded-xl border-2 shadow-sm ${stateStyles[visual]}`}
      >
        {view === "memory" ? (
          <div className="min-w-40">
            <div className="border-b border-current/15 px-3 py-1.5 text-center text-xs font-bold text-slate-600">
              Alamat simulasi: {getSimulatedAddress(node.id)}
            </div>
            <div className="grid grid-cols-2 divide-x divide-current/20 text-center">
              <div className="px-4 py-3">
                <span className="block text-[10px] font-bold uppercase text-slate-500">value</span>
                <strong>{node.value}</strong>
              </div>
              <div className="px-3 py-3">
                <span className="block text-[10px] font-bold uppercase text-slate-500">next</span>
                <strong className="text-xs">{nextLabel}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid min-w-32 grid-cols-[1fr_3rem] divide-x divide-current/20 text-center">
            <div className="px-5 py-4">
              <span className="sr-only">value </span>
              <strong className="text-lg">{node.value}</strong>
            </div>
            <div className="flex items-center justify-center px-2 py-4 text-xs font-bold text-slate-600">
              {node.nextId === null ? "NULL" : "next"}
            </div>
          </div>
        )}
      </div>
      {visual !== "normal" ? (
        <span className="mt-1 block text-center text-[11px] font-bold text-slate-600">
          {stateLabels[visual]}
        </span>
      ) : null}
    </motion.div>
  );
}

export function LinkedListRenderer({
  state,
  visualState,
  view,
}: LinkedListRendererProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const ordered = getOrderedNodes(state);
  const orderedIds = new Set(ordered.map((node) => node.id));
  const detached = state.nodes.filter((node) => !orderedIds.has(node.id));
  const visualById = new Map(
    visualState.map((entry) => [entry.elementId, entry.state]),
  );

  const renderNodes = (nodes: readonly LinkedListNode[]) => (
    <AnimatePresence initial={false}>
      {nodes.map((node, index) => (
        <div key={node.id} className="flex items-center">
          <NodeCard
            node={node}
            visual={visualById.get(node.id as StableElementId) ?? "normal"}
            view={view}
            isHead={state.headId === node.id}
            reduceMotion={prefersReducedMotion}
          />
          {index < nodes.length - 1 && node.nextId !== null ? <Arrow /> : null}
        </div>
      ))}
    </AnimatePresence>
  );

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6"
      aria-label="Visualisasi singly linked list"
      data-testid="linked-list-canvas"
    >
      <div className="overflow-x-auto pb-3">
        {ordered.length === 0 ? (
          <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-center text-slate-500">
            HEAD → NULL<br />Linked list kosong
          </div>
        ) : (
          <div className="flex min-h-36 min-w-max items-center pr-6">
            {renderNodes(ordered)}
            <div className="flex items-center pt-7">
              <Arrow />
              <span className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm font-bold">
                NULL
              </span>
            </div>
          </div>
        )}
      </div>
      {detached.length > 0 ? (
        <div className="mt-4 border-t border-dashed border-slate-300 pt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Node sementara / target terlepas
          </p>
          <div className="flex min-w-max gap-4">{renderNodes(detached)}</div>
        </div>
      ) : null}
      <p className="mt-3 text-xs text-slate-500">
        {view === "memory"
          ? "Alamat simulasi bersifat deterministik dan bukan alamat memori nyata."
          : "Setiap kotak menampilkan [ value | next ]; panah mengikuti pointer next."}
      </p>
    </section>
  );
}
