"use client";

import type { LectureOutline } from "@/lib/schemas/outline";
import { formatStudyDuration } from "@/lib/lecture-timing";
import { Card } from "@/components/ui/card";

export function OutlinePlanView({ outline }: { outline: LectureOutline }) {
  return (
    <Card className="p-6">
      <div className="mb-6 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <h2 className="text-xl font-semibold">{outline.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {outline.summary}
        </p>
        <p className="mt-3 text-sm text-violet-600 dark:text-violet-400">
          ~{outline.targetSlideCount ?? 10} slides
          {outline.estimatedStudyMinutes != null &&
            ` · ${formatStudyDuration(outline.estimatedStudyMinutes)} study`}
        </p>
      </div>

      {outline.learningObjectives.length > 0 && (
        <section className="mb-6">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Learning objectives
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
            {outline.learningObjectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Sections
        </h3>
        <ol className="space-y-4">
          {outline.sections.map((section, si) => (
            <li
              key={si}
              className="rounded-lg border border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium">
                  {si + 1}. {section.title}
                </span>
              </div>
              {section.learningGoals.length > 0 && (
                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                  {section.learningGoals.map((g, gi) => (
                    <li key={gi}>{g}</li>
                  ))}
                </ul>
              )}
              {section.subsections.map((sub, subIdx) => (
                <div key={subIdx} className="mt-3 border-l-2 border-violet-200 pl-3 dark:border-violet-800">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {sub.title}
                  </p>
                  {sub.keyPoints.length > 0 && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-zinc-500">
                      {sub.keyPoints.map((p, pi) => (
                        <li key={pi}>{p}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </li>
          ))}
        </ol>
      </section>
    </Card>
  );
}
