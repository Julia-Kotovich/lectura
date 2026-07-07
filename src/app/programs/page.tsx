"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { BookOpen, GraduationCap, Layers } from "lucide-react";

export default function ProgramsPage() {
  const { data: programs, isLoading } = trpc.programs.list.useQuery();

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Programs</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Full degree programs (e.g. MSc) — each entry is a handbook module, not a weekly lecture.
        </p>
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}

      <ul className="grid gap-4 lg:grid-cols-2">
        {programs?.map((program) => (
          <li key={program.slug}>
            <Link href={`/programs/${program.slug}`}>
              <Card className="flex h-full flex-col p-6 transition-colors hover:border-violet-300 dark:hover:border-violet-700">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-950 dark:text-violet-200">
                    {program.ects} ECTS
                  </span>
                  <span className="text-xs text-zinc-500">{program.cohort}</span>
                </div>
                <h2 className="text-lg font-semibold">{program.title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{program.subtitle}</p>

                <dl className="mt-4 grid grid-cols-1 gap-2 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-zinc-400" />
                    {program.coordinator}
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-zinc-400" />
                    {program.institution}
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-zinc-400" />
                    {program.moduleCount} modules
                  </div>
                </dl>

                <p className="mt-4 line-clamp-3 text-sm text-zinc-500">{program.description}</p>

                <span className="mt-4 text-sm font-medium text-violet-600 hover:underline">
                  Open program →
                </span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      {!isLoading && !programs?.length && (
        <p className="text-sm text-zinc-500">No programs available yet.</p>
      )}
    </AppShell>
  );
}
