"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { BookOpen, GraduationCap, Layers } from "lucide-react";

export default function CoursesPage() {
  const { data: courses, isLoading } = trpc.courses.list.useQuery();

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Courses</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Full semester courses you can adopt — each ships with curated outlines for every lecture.
        </p>
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}

      <ul className="grid gap-4 lg:grid-cols-2">
        {courses?.map((course) => (
          <li key={course.slug}>
            <Link href={`/courses/${course.slug}`}>
              <Card className="flex h-full flex-col p-6 transition-colors hover:border-violet-300 dark:hover:border-violet-700">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-zinc-500">{course.semester}</span>
                </div>
                <h2 className="text-lg font-semibold">{course.title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{course.subtitle}</p>

                <dl className="mt-4 grid grid-cols-1 gap-2 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-zinc-400" />
                    {course.instructor}
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-zinc-400" />
                    {course.institution}
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-zinc-400" />
                    {course.lectureCount} lectures
                  </div>
                </dl>

                <p className="mt-4 line-clamp-3 text-sm text-zinc-500">
                  {course.description}
                </p>

                <span className="mt-4 text-sm font-medium text-violet-600 hover:underline">
                  Open course →
                </span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      {!isLoading && !courses?.length && (
        <p className="text-sm text-zinc-500">No courses available yet.</p>
      )}
    </AppShell>
  );
}
