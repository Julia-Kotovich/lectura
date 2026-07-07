"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  ExternalLink,
  FileText,
  GraduationCap,
  ImageIcon,
  Layers,
  Lightbulb,
  ListChecks,
  Target,
} from "lucide-react";

export default function ProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: program, isLoading } = trpc.programs.get.useQuery({ slug });
  const createLecture = trpc.programs.createLecture.useMutation();
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function toggleExpanded(moduleSlug: string) {
    setExpanded((prev) => ({ ...prev, [moduleSlug]: !prev[moduleSlug] }));
  }

  async function adoptSection(moduleSlug: string, sectionIndex: number) {
    const actionKey = `${moduleSlug}:${sectionIndex}`;
    setBusySlug(actionKey);
    try {
      const lecture = await createLecture.mutateAsync({
        programSlug: slug,
        moduleSlug,
        sectionIndex,
      });
      router.push(`/lectures/${lecture.id}`);
    } finally {
      setBusySlug(null);
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <p className="text-sm text-zinc-500">Loading program…</p>
      </AppShell>
    );
  }

  if (!program) {
    return (
      <AppShell>
        <p className="text-sm text-zinc-500">Program not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link
        href="/programs"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        All programs
      </Link>

      <header className="mb-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{program.ects} ECTS</Badge>
          <span className="text-xs text-zinc-500">{program.cohort}</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{program.title}</h1>
        <p className="text-base text-zinc-500">{program.subtitle}</p>

        <dl className="mt-4 grid gap-2 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
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
            {program.modules.length} modules
          </div>
        </dl>
      </header>

      <Card className="mb-8 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          About this program
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {program.description}
        </p>

        <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Tracks & topics
        </h3>
        <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
          {program.topics.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Card>

      <h2 className="mb-3 text-lg font-semibold">Program modules</h2>
      <p className="mb-4 text-sm text-zinc-500">
        Each module is a handbook unit (typically 5 CP). Open a module to create lecture drafts
        from individual lecture-sized sections of its outline.
      </p>

      <ol className="space-y-3">
        {program.modules.map((mod) => {
          const isOpen = !!expanded[mod.slug];
          const subsectionCount = mod.sections.reduce(
            (acc, s) => acc + s.subsections.length,
            0,
          );
          const exerciseCount = mod.sections.reduce((acc, s) => acc + s.exerciseCount, 0);
          const exampleCount = mod.sections.reduce(
            (acc, s) => acc + s.subsections.reduce((a, ss) => a + ss.exampleCount, 0),
            0,
          );

          return (
            <li key={mod.slug}>
              <Card className="overflow-hidden p-0">
                <div className="flex flex-wrap items-start justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      <span className="font-mono text-zinc-600 dark:text-zinc-400">{mod.code}</span>
                      <span>Semester {mod.semester}</span>
                      <span>{mod.cp} CP</span>
                      <span>{mod.track}</span>
                      <Badge className="text-[10px]">{mod.status}</Badge>
                      {mod.targetSlideCount != null && (
                        <span>~{mod.targetSlideCount} slides</span>
                      )}
                      <span className="inline-flex items-center gap-1 text-zinc-400">
                        <FileText className="h-3.5 w-3.5" />
                        handbook
                      </span>
                    </div>
                    <h3 className="mt-1 font-semibold">{mod.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{mod.summary}</p>

                    {mod.learningObjectives.length > 0 && (
                      <div className="mt-3">
                        <div className="mb-1 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                          <Target className="h-3.5 w-3.5" />
                          Learning objectives
                        </div>
                        <ul className="list-disc space-y-0.5 pl-5 text-xs text-zinc-600 dark:text-zinc-400">
                          {mod.learningObjectives.slice(0, 3).map((o, oi) => (
                            <li key={oi}>{o}</li>
                          ))}
                          {mod.learningObjectives.length > 3 && (
                            <li className="text-zinc-400">
                              + {mod.learningObjectives.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {mod.hasSyllabus && (
                      <Link
                        href={`/programs/${slug}/modules/${mod.slug}/syllabus`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:underline"
                      >
                        View syllabus
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleExpanded(mod.slug)}
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
                        {mod.sections.length} sections
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
                      {mod.sections.map((section, si) => (
                        <li
                          key={si}
                          className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                              <span className="mr-2 text-zinc-400">{si + 1}.</span>
                              {section.title}
                            </h4>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busySlug === `${mod.slug}:${si}`}
                              onClick={() => adoptSection(mod.slug, si)}
                            >
                              {busySlug === `${mod.slug}:${si}` ? "Adding…" : "Use as lecture"}
                            </Button>
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
                                >
                                  {ss.title}
                                  <span className="text-zinc-400">·</span>
                                  <span className="text-zinc-500">{ss.keyPointCount} pts</span>
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
