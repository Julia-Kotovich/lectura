"use client";

import { OOP_BACHELOR_SLUG, OOP_SEMESTER_WEEKS } from "@/lib/course-frameworks";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CourseSemesterPlan({
  frameworkSlug,
  currentWeek,
}: {
  frameworkSlug?: string | null;
  currentWeek?: number | null;
}) {
  if (frameworkSlug !== OOP_BACHELOR_SLUG) return null;

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold">OOP course — semester plan (13 weeks)</h3>
      <p className="mt-1 text-xs text-zinc-500">
        1 lecture + 1 lab per week · Bachelor CS · progressive complexity
      </p>
      <ul className="mt-4 space-y-2">
        {OOP_SEMESTER_WEEKS.map((w) => (
          <li
            key={w.week}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm",
              currentWeek === w.week
                ? "border-violet-300 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/40"
                : "border-zinc-100 dark:border-zinc-800",
            )}
          >
            <span className="font-medium">Week {w.week}</span>
            <span className="mx-2 text-zinc-400">·</span>
            <span>{w.lecture}</span>
            <p className="mt-0.5 text-xs text-zinc-500">Lab: {w.lab}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
