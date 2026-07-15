"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronRight, Plus } from "lucide-react";

function getLectureNumber(title: string) {
  const match = title.match(/\blecture\s+(\d+)\b/i);

  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

export default function HomePage() {
  const { data: lectures, isLoading } = trpc.lecture.list.useQuery();
  const sortedLectures = [...(lectures ?? [])].sort((a, b) => {
    const numberDiff = getLectureNumber(a.title) - getLectureNumber(b.title);

    if (numberDiff !== 0) {
      return numberDiff;
    }

    return a.title.localeCompare(b.title);
  });

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Your lectures</h1>
        <p className="mt-2 max-w-xl text-zinc-500">
          Plan CS lectures with AI, generate slides, evaluate quality, and present — all locally.
        </p>
      </div>

      <div className="mb-6">
        <Link
          href="/lectures/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white hover:bg-violet-500"
        >
          <Plus className="h-4 w-4" />
          New lecture
        </Link>
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}

      {!isLoading && lectures?.length === 0 && (
        <Card className="flex flex-col items-center gap-4 p-12 text-center">
          <BookOpen className="h-10 w-10 text-violet-600" />
          <p className="text-zinc-500">No lectures yet. Create your first AI-powered deck.</p>
          <Link
            href="/lectures/new"
            className="inline-flex h-10 items-center rounded-lg bg-violet-600 px-4 text-sm font-medium text-white hover:bg-violet-500"
          >
            Get started
          </Link>
        </Card>
      )}

      <ul className="space-y-3">
        {sortedLectures.map((lecture, index) => (
          <li key={lecture.id}>
            <Link href={`/lectures/${lecture.id}`} className="block">
              <Card className="group p-0 transition-colors hover:border-violet-300 hover:bg-violet-50/40 dark:hover:border-violet-800 dark:hover:bg-violet-950/20">
                <div className="flex items-center gap-4 px-4 py-3 sm:px-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-sm font-semibold text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-semibold">{lecture.title}</h2>
                      <Badge>{lecture.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
                      {lecture.description ?? "No description"}
                    </p>
                  </div>

                  <div className="hidden shrink-0 items-center gap-3 text-sm text-zinc-400 sm:flex">
                    <span>{lecture._count.slides} slides</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 sm:hidden" />
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
