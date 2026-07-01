"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  FileText,
  GraduationCap,
  ImageIcon,
  Layers,
  Lightbulb,
  ListChecks,
  Target,
} from "lucide-react";

export default function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: course, isLoading } = trpc.courses.get.useQuery({ slug });
  const createLecture = trpc.courses.createLecture.useMutation();
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function toggleExpanded(lectureSlug: string) {
    setExpanded((prev) => ({ ...prev, [lectureSlug]: !prev[lectureSlug] }));
  }

  async function adoptLecture(lectureSlug: string) {
    setBusySlug(lectureSlug);
    try {
      const lecture = await createLecture.mutateAsync({
        courseSlug: slug,
        lectureSlug,
      });
      router.push(`/lectures/${lecture.id}`);
    } finally {
      setBusySlug(null);
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <p className="text-sm text-zinc-500">Loading course…</p>
      </AppShell>
    );
  }

  if (!course) {
    return (
      <AppShell>
        <p className="text-sm text-zinc-500">Course not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link
        href="/courses"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        All courses
      </Link>

      <header className="mb-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">{course.semester}</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{course.title}</h1>
        <p className="text-base text-zinc-500">{course.subtitle}</p>

        <dl className="mt-4 grid gap-2 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
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
            {course.lectures.length} lectures
          </div>
        </dl>
      </header>

      <Card className="mb-8 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          About this course
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {course.description}
        </p>

        <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Topics covered
        </h3>
        <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
          {course.topics.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Card>

      <h2 className="mb-3 text-lg font-semibold">Lectures</h2>
      <ol className="space-y-3">
        {course.lectures.map((lecture, i) => {
          const isOpen = !!expanded[lecture.slug];
          const subsectionCount = lecture.sections.reduce(
            (acc, s) => acc + s.subsections.length,
            0,
          );
          const exerciseCount = lecture.sections.reduce(
            (acc, s) => acc + s.exerciseCount,
            0,
          );
          const exampleCount = lecture.sections.reduce(
            (acc, s) =>
              acc + s.subsections.reduce((a, ss) => a + ss.exampleCount, 0),
            0,
          );

          return (
            <li key={lecture.slug}>
              <Card className="overflow-hidden p-0">
                <div className="flex flex-wrap items-start justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        Week {i + 1}
                      </span>
                      <span>{lecture.sectionCount} sections</span>
                      <span>{subsectionCount} subsections</span>
                      {lecture.targetSlideCount != null && (
                        <span>~{lecture.targetSlideCount} slides</span>
                      )}
                      {exerciseCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Dumbbell className="h-3.5 w-3.5" />
                          {exerciseCount} exercise{exerciseCount === 1 ? "" : "s"}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-zinc-400">
                        <FileText className="h-3.5 w-3.5" />
                        {lecture.sourcePdf}
                      </span>
                    </div>
                    <h3 className="mt-1 font-semibold">{lecture.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{lecture.summary}</p>

                    {lecture.learningObjectives.length > 0 && (
                      <div className="mt-3">
                        <div className="mb-1 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                          <Target className="h-3.5 w-3.5" />
                          Learning objectives
                        </div>
                        <ul className="list-disc space-y-0.5 pl-5 text-xs text-zinc-600 dark:text-zinc-400">
                          {lecture.learningObjectives.slice(0, 3).map((o, oi) => (
                            <li key={oi}>{o}</li>
                          ))}
                          {lecture.learningObjectives.length > 3 && (
                            <li className="text-zinc-400">
                              + {lecture.learningObjectives.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Button
                      size="sm"
                      disabled={busySlug === lecture.slug}
                      onClick={() => adoptLecture(lecture.slug)}
                    >
                      {busySlug === lecture.slug ? "Adding…" : "Use as lecture"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => toggleExpanded(lecture.slug)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      aria-expanded={isOpen}
                    >
                      {isOpen ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                      {isOpen ? "Hide outline" : "Show outline"}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-zinc-100 bg-zinc-50/60 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                    <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <ListChecks className="h-3.5 w-3.5" />
                        {lecture.sections.length} sections
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        {subsectionCount} subsections
                      </span>
                      {exampleCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Lightbulb className="h-3.5 w-3.5" />
                          {exampleCount} examples
                        </span>
                      )}
                      {exerciseCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Dumbbell className="h-3.5 w-3.5" />
                          {exerciseCount} exercises
                        </span>
                      )}
                    </div>

                    <ol className="space-y-3">
                      {lecture.sections.map((section, si) => (
                        <li
                          key={si}
                          className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                              <span className="mr-2 text-zinc-400">{si + 1}.</span>
                              {section.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                              {section.exerciseCount > 0 && (
                                <span className="inline-flex items-center gap-1">
                                  <Dumbbell className="h-3 w-3" />
                                  {section.exerciseCount}
                                </span>
                              )}
                            </div>
                          </div>

                          {section.learningGoals.length > 0 && (
                            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-zinc-600 dark:text-zinc-400">
                              {section.learningGoals.map((g, gi) => (
                                <li key={gi}>{g}</li>
                              ))}
                            </ul>
                          )}

                          {section.subsections.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {section.subsections.map((ss, ssi) => (
                                <span
                                  key={ssi}
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs",
                                    "border-zinc-200 bg-zinc-50 text-zinc-700",
                                    "dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
                                  )}
                                  title={`${ss.keyPointCount} key points${ss.exampleCount ? `, ${ss.exampleCount} examples` : ""}${ss.hasDiagram ? ", diagram suggested" : ""}`}
                                >
                                  {ss.title}
                                  <span className="text-zinc-400">·</span>
                                  <span className="text-zinc-500">
                                    {ss.keyPointCount} pts
                                  </span>
                                  {ss.exampleCount > 0 && (
                                    <Lightbulb className="h-3 w-3 text-amber-500" />
                                  )}
                                  {ss.hasDiagram && (
                                    <ImageIcon className="h-3 w-3 text-violet-500" />
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ol>
    </AppShell>
  );
}
