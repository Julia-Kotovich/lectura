"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BLOOM_LEVELS,
  bloomAnalysisSchema,
  type BloomLevel,
  type BloomDistribution,
} from "@/lib/schemas/evaluation";
import { BLOOM_MAX_IMPROVE_ROUNDS, BLOOM_TARGET_SCORE } from "@/lib/bloom/problem-slides";
import { BloomProgressCharts } from "@/components/evaluation/bloom-progress-charts";

interface EvaluationRecord {
  id?: string;
  overall: number;
  scores: unknown;
  feedback: unknown;
  createdAt?: string | Date;
}

interface HistoryItem {
  id: string;
  createdAt: string | Date;
  alignmentScore: number;
  dominantLevel: string | null;
  gapCount: number;
  distribution?: BloomDistribution | null;
}

interface ImproveProgress {
  status: string;
  phase: string;
  current: number;
  total: number;
  currentSlideTitle?: string;
  beforeScore?: number;
  afterScore?: number;
  improvedCount?: number;
  skippedReason?: string;
  error?: string;
}

export function ScorePanel({
  evaluation,
  history = [],
  progress,
  improveRounds = 0,
}: {
  evaluation: EvaluationRecord;
  history?: HistoryItem[];
  progress?: ImproveProgress | null;
  improveRounds?: number;
}) {
  const feedback = (evaluation.feedback ?? {}) as { bloomAnalysis?: unknown };
  const bloomParsed = bloomAnalysisSchema.safeParse(feedback.bloomAnalysis);
  const bloom = bloomParsed.success ? bloomParsed.data : null;

  if (!bloom) {
    return (
      <Card className="p-6">
        <p className="text-sm text-zinc-500">
          No Bloom evaluation yet. Press Evaluate Bloom to analyze cognitive level alignment.
        </p>
      </Card>
    );
  }

  const previous = history[1];
  const scoreDelta =
    previous != null ? bloom.alignmentScore - previous.alignmentScore : null;
  const atTarget = bloom.alignmentScore >= BLOOM_TARGET_SCORE;
  const atLimit = improveRounds >= BLOOM_MAX_IMPROVE_ROUNDS;

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">Bloom&apos;s taxonomy</h3>
          <p className="text-sm text-zinc-500">Cognitive level alignment for this deck</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="border border-violet-300 bg-transparent capitalize dark:border-violet-700">
            Dominant: {bloom.dominantLevel}
          </Badge>
          <Badge className="text-base">{bloom.alignmentScore}/100</Badge>
          {scoreDelta != null && scoreDelta !== 0 && (
            <Badge
              className={
                scoreDelta > 0
                  ? "border border-emerald-300 bg-transparent text-emerald-700 dark:border-emerald-700 dark:text-emerald-300"
                  : "border border-amber-300 bg-transparent text-amber-700 dark:border-amber-700 dark:text-amber-300"
              }
            >
              {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta} vs previous
            </Badge>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <BloomProgressCharts
          history={history.map((item) => ({
            id: item.id,
            alignmentScore: item.alignmentScore,
            distribution: item.distribution,
          }))}
        />
      )}

      {progress && (progress.status === "running" || progress.status === "skipped") && (
        <div className="mb-4 rounded-lg border border-violet-200 bg-violet-50/60 p-3 text-sm dark:border-violet-900 dark:bg-violet-950/30">
          {progress.status === "running" && progress.phase === "improving" && (
            <p>
              Improving problem slides…{" "}
              <span className="font-medium">
                {progress.current}/{progress.total}
              </span>
              {progress.currentSlideTitle ? ` — ${progress.currentSlideTitle}` : ""}
            </p>
          )}
          {progress.status === "running" && progress.phase === "reevaluating" && (
            <p>Re-evaluating Bloom alignment after improve…</p>
          )}
          {progress.status === "skipped" && progress.skippedReason && (
            <p className="text-amber-800 dark:text-amber-200">{progress.skippedReason}</p>
          )}
          {progress.total > 0 && progress.status === "running" && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-violet-200 dark:bg-violet-900">
              <div
                className="h-full rounded-full bg-violet-500 transition-all"
                style={{
                  width: `${Math.round((progress.current / progress.total) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>
      )}

      {progress?.status === "completed" &&
        progress.beforeScore != null &&
        progress.afterScore != null && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/20">
            Improved {progress.improvedCount ?? 0} slide
            {(progress.improvedCount ?? 0) === 1 ? "" : "s"}:{" "}
            <span className="font-semibold">{progress.beforeScore}</span>
            {" → "}
            <span className="font-semibold">{progress.afterScore}</span>
          </div>
        )}

      <div className="mb-4 flex flex-wrap gap-2 text-xs text-zinc-500">
        <span>
          Target score ≥ {BLOOM_TARGET_SCORE}
          {atTarget ? " · reached" : ""}
        </span>
        <span>·</span>
        <span>
          Improve rounds {improveRounds}/{BLOOM_MAX_IMPROVE_ROUNDS}
          {atLimit ? " · limit reached" : ""}
        </span>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {BLOOM_LEVELS.map((level) => (
          <div key={level} className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500 capitalize">{level}</p>
            <p className="text-lg font-semibold">{bloom.distribution[level]}%</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-violet-500"
                style={{ width: `${bloom.distribution[level]}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {bloom.objectiveAlignments.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Objective alignment
          </p>
          <ul className="space-y-2">
            {bloom.objectiveAlignments.map((item, i) => (
              <li
                key={i}
                className="rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{item.objective}</span>
                  <AlignmentBadge status={item.status} />
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Expected <LevelLabel level={item.expectedLevel} /> → observed{" "}
                  <LevelLabel level={item.observedLevel} />
                </p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{item.rationale}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {bloom.slideTags && bloom.slideTags.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Slide tags
          </p>
          <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            {bloom.slideTags.map((tag, i) => (
              <li key={i}>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{tag.slideTitle}</span>
                {" — "}
                <span className="capitalize">{tag.primaryLevel}</span>
                {tag.evidence ? `: ${tag.evidence}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {bloom.gaps.length > 0 && <FeedbackList title="Gaps" items={bloom.gaps} tone="warning" />}
      {bloom.suggestions.length > 0 && (
        <div className={bloom.gaps.length > 0 ? "mt-3" : undefined}>
          <FeedbackList title="Suggestions" items={bloom.suggestions} tone="neutral" />
        </div>
      )}

      <p className="mt-4 text-xs text-zinc-500">
        Use <span className="font-medium">Improve &amp; re-evaluate</span> to regenerate only
        problem slides, then run Bloom again automatically.
      </p>
    </Card>
  );
}

function LevelLabel({ level }: { level: BloomLevel }) {
  return <span className="capitalize text-violet-700 dark:text-violet-300">{level}</span>;
}

function AlignmentBadge({ status }: { status: "aligned" | "partially_aligned" | "misaligned" }) {
  const styles = {
    aligned:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
    partially_aligned:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
    misaligned:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
  };
  const labels = {
    aligned: "aligned",
    partially_aligned: "partial",
    misaligned: "misaligned",
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function FeedbackList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "warning" | "neutral";
}) {
  const color =
    tone === "warning"
      ? "text-amber-700 dark:text-amber-400"
      : "text-zinc-700 dark:text-zinc-300";

  return (
    <div>
      <p className={`mb-2 text-sm font-medium ${color}`}>{title}</p>
      <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
        {items.map((item, i) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
