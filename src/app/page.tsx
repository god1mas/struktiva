import Link from "next/link";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white px-8 py-16 text-center shadow-sm sm:px-16">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">
          Project foundation
        </p>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          {site.tagline}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-600">
          {site.foundationMessage}
        </p>
        <Link
          href="/visualizer/linked-list"
          className="mt-8 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Buka visualizer Linked List
        </Link>
      </section>
    </main>
  );
}
