import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/ui/brand-mark";
import { site } from "@/lib/site";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 font-semibold tracking-tight text-slate-950">
          <Link href="/" aria-label="Struktiva beranda">
            <BrandMark />
          </Link>
          <nav aria-label="Navigasi utama">
            <Link
              href="/visualizer/linked-list"
              className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-blue-700"
            >
              Linked List
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-slate-200 px-6 py-4 text-center text-sm text-slate-500">
        {site.name}
      </footer>
    </>
  );
}
