"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EvaluationRecord {
  overall: number;
  scores: unknown;
  feedback: unknown;
}

export function ScorePanel({ evaluation }: { evaluation: EvaluationRecord }) {
  const scores = Array.isArray(evaluation.scores)
    ? (evaluation.scores as { name: string; score: number; rationale: string }[])
    : [];
  const feedback = (evaluation.feedback ?? {}) as {
    strengths?: string[];
    warnings?: string[];
    suggestions?: string[];
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Quality score</h3>
          <p className="text-sm text-zinc-500">AI evaluation of teaching clarity</p>
        </div>
        <Badge className="text-base">{Math.round(evaluation.overall)}/100</Badge>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scores.map((dim) => (
          <div key={dim.name} className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
            <p className="text-xs uppercase tracking-wide text-zinc-500">{dim.name}</p>
            <p className="text-xl font-semibold">{dim.score}</p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{dim.rationale}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FeedbackList title="Strengths" items={feedback.strengths ?? []} tone="positive" />
        <FeedbackList title="Warnings" items={feedback.warnings ?? []} tone="warning" />
        <FeedbackList title="Suggestions" items={feedback.suggestions ?? []} tone="neutral" />
      </div>
    </Card>
  );
}

function FeedbackList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "positive" | "warning" | "neutral";
}) {
  const color =
    tone === "positive"
      ? "text-emerald-700 dark:text-emerald-400"
      : tone === "warning"
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
