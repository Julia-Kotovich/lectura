"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus } from "lucide-react";

export default function HomePage() {
  const { data: lectures, isLoading } = trpc.lecture.list.useQuery();

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

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lectures?.map((lecture) => (
          <li key={lecture.id}>
            <Link href={`/lectures/${lecture.id}`}>
              <Card className="p-5 transition-shadow hover:shadow-md">
                <h2 className="font-semibold">{lecture.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                  {lecture.description ?? "No description"}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge>{lecture.status.replace("_", " ")}</Badge>
                  <span className="text-xs text-zinc-400">
                    {lecture._count.slides} slides
                  </span>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
