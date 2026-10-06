"use client";

import { useState } from "react";
import type { CodeLanguage, CodeLineId, SynchronizedCode } from "../core";

interface CodePanelProps {
  readonly code: SynchronizedCode;
  readonly activeCppLineIds: readonly CodeLineId[];
  readonly activePseudocodeLineIds: readonly CodeLineId[];
}

export function CodePanel({
  code,
  activeCppLineIds,
  activePseudocodeLineIds,
}: CodePanelProps) {
  const [language, setLanguage] = useState<CodeLanguage>("pseudocode");
  const listing = code[language];
  const active = new Set(
    language === "cpp" ? activeCppLineIds : activePseudocodeLineIds,
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100">
      <div
        className="flex border-b border-slate-800 px-3 pt-3"
        role="tablist"
        aria-label="Bahasa kode"
      >
        {(["pseudocode", "cpp"] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={language === option}
            onClick={() => setLanguage(option)}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold ${
              language === option
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {option === "cpp" ? "C++" : "Pseudocode"}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="overflow-x-auto py-3 font-mono text-sm">
        {listing.lines.map((line, index) => {
          const isActive = active.has(line.id);
          return (
            <div
              key={line.id}
              data-active={isActive ? "true" : "false"}
              aria-current={isActive ? "step" : undefined}
              className={`grid min-w-max grid-cols-[3rem_1fr] px-4 py-1 ${
                isActive ? "bg-blue-500/25 text-blue-100" : "text-slate-300"
              }`}
            >
              <span className="select-none text-right text-slate-600">
                {index + 1}
              </span>
              <code className="pl-4 pr-6">{line.content}</code>
            </div>
          );
        })}
      </div>
    </section>
  );
}
