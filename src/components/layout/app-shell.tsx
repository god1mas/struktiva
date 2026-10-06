import type { ReactNode } from "react";
import { BrandMark } from "@/components/ui/brand-mark";
import { site } from "@/lib/site";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-5xl font-semibold tracking-tight text-slate-950">
          <BrandMark />
        </div>
      </header>
      {children}
      <footer className="border-t border-slate-200 px-6 py-4 text-center text-sm text-slate-500">
        {site.name}
      </footer>
    </>
  );
}
