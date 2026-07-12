import {
  BLOOM_LEVELS,
  type BloomDistribution,
  type BloomLevel,
} from "@/lib/schemas/evaluation";

/** Shared palette for Bloom level charts (notebook HTML mirrors these hex values). */
export const BLOOM_LEVEL_CHART_COLORS: Record<BloomLevel, string> = {
  remember: "#64748b",
  understand: "#3b82f6",
  apply: "#10b981",
  analyze: "#f59e0b",
  evaluate: "#f97316",
  create: "#8b5cf6",
};

export type BloomProgressPoint = {
  id: string;
  label: string;
  alignmentScore: number;
  distribution?: BloomDistribution;
};

export function buildBloomProgressPoints(
  history: Array<{
    id: string;
    alignmentScore: number;
    distribution?: BloomDistribution | null;
  }>,
): BloomProgressPoint[] {
  const chronological = [...history].reverse();
  return chronological.map((item, index) => ({
    id: item.id,
    label: index === 0 ? "Initial" : `Round ${index}`,
    alignmentScore: item.alignmentScore,
    distribution: item.distribution ?? undefined,
  }));
}

export function scoreChartGeometry(
  points: BloomProgressPoint[],
  options?: { width?: number; height?: number; padding?: number; targetScore?: number },
) {
  const width = options?.width ?? 360;
  const height = options?.height ?? 160;
  const padding = options?.padding ?? 28;
  const targetScore = options?.targetScore ?? 95;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const count = Math.max(points.length, 1);

  const coords = points.map((point, index) => {
    const x =
      padding + (count === 1 ? innerW / 2 : (index / (count - 1)) * innerW);
    const y = padding + innerH - (point.alignmentScore / 100) * innerH;
    return { ...point, x, y };
  });

  const targetY = padding + innerH - (targetScore / 100) * innerH;
  const polyline = coords.map((c) => `${c.x},${c.y}`).join(" ");

  return { width, height, padding, targetScore, targetY, coords, polyline };
}

export function distributionBarSegments(
  distribution: BloomDistribution,
  barWidth: number,
): Array<{ level: BloomLevel; width: number; color: string; pct: number }> {
  return BLOOM_LEVELS.map((level) => ({
    level,
    pct: distribution[level],
    width: (distribution[level] / 100) * barWidth,
    color: BLOOM_LEVEL_CHART_COLORS[level],
  })).filter((segment) => segment.pct > 0);
}
