import { describe, expect, it } from "vitest";
import {
  buildBloomProgressPoints,
  distributionBarSegments,
  scoreChartGeometry,
} from "./progress-viz";

describe("buildBloomProgressPoints", () => {
  it("orders history oldest-first with round labels", () => {
    const points = buildBloomProgressPoints([
      { id: "b", alignmentScore: 88, distribution: null },
      { id: "a", alignmentScore: 72, distribution: null },
    ]);
    expect(points.map((p) => p.label)).toEqual(["Initial", "Round 1"]);
    expect(points.map((p) => p.alignmentScore)).toEqual([72, 88]);
  });
});

describe("scoreChartGeometry", () => {
  it("places higher scores higher on the chart", () => {
    const { coords } = scoreChartGeometry([
      { id: "1", label: "Initial", alignmentScore: 60 },
      { id: "2", label: "Round 1", alignmentScore: 90 },
    ]);
    expect(coords[1]!.y).toBeLessThan(coords[0]!.y);
  });
});

describe("distributionBarSegments", () => {
  it("skips zero-percent levels", () => {
    const segments = distributionBarSegments(
      {
        remember: 0,
        understand: 40,
        apply: 30,
        analyze: 30,
        evaluate: 0,
        create: 0,
      },
      200,
    );
    expect(segments.map((s) => s.level)).toEqual(["understand", "apply", "analyze"]);
    expect(segments.reduce((sum, s) => sum + s.width, 0)).toBeCloseTo(200, 5);
  });
});
