"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BLOOM_LEVELS, type BloomDistribution } from "@/lib/schemas/evaluation";
import {
  BLOOM_LEVEL_CHART_COLORS,
  buildBloomProgressPoints,
} from "@/lib/bloom/progress-viz";
import { BLOOM_TARGET_SCORE } from "@/lib/bloom/problem-slides";

type HistoryRow = {
  id: string;
  alignmentScore: number;
  distribution?: BloomDistribution | null;
};

export function BloomProgressCharts({
  history,
  targetScore = BLOOM_TARGET_SCORE,
}: {
  history: HistoryRow[];
  targetScore?: number;
}) {
  if (history.length === 0) return null;

  const points = buildBloomProgressPoints(history);
  const scoreData = points.map((point) => ({
    label: point.label,
    score: point.alignmentScore,
  }));

  const distributionData = points
    .filter((point) => point.distribution)
    .map((point) => ({
      label: point.label,
      ...point.distribution!,
    }));

  return (
    <div className="mb-4 space-y-4">
      <ChartCard title="Alignment score progress">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={scoreData} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`${value}`, "Alignment score"]}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
            />
            <ReferenceLine
              y={targetScore}
              stroke="#059669"
              strokeDasharray="5 4"
              label={{ value: `Target ${targetScore}`, position: "insideTopRight", fontSize: 11 }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#7c3aed"
              strokeWidth={2.5}
              dot={{ r: 5, fill: "#7c3aed", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {distributionData.length > 0 && (
        <ChartCard title="Cognitive distribution over time">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={distributionData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-200 dark:stroke-zinc-800" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
              <Tooltip
                formatter={(value, name) => [`${value}%`, String(name)]}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value) => String(value)} />
              {BLOOM_LEVELS.map((level) => (
                <Bar
                  key={level}
                  dataKey={level}
                  stackId="bloom"
                  fill={BLOOM_LEVEL_CHART_COLORS[level]}
                  name={level.charAt(0).toUpperCase() + level.slice(1)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">{title}</p>
      {children}
    </div>
  );
}
