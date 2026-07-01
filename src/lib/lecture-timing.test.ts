import { describe, expect, it } from "vitest";
import { enrichOutlineMetadata, formatStudyDuration } from "./lecture-timing";
import { lectureOutlineSchema } from "./schemas/outline";

describe("lecture-timing", () => {
  it("defaults to ~10 slides and computes study time", () => {
    const outline = enrichOutlineMetadata(
      lectureOutlineSchema.parse({
        title: "OOP",
        summary: "Summary",
        learningObjectives: ["Goal"],
        sections: [
          {
            title: "Section",
            learningGoals: ["Learn"],
            subsections: [{ title: "Sub", keyPoints: ["Point"] }],
          },
        ],
      }),
    );

    expect(outline.targetSlideCount).toBe(10);
    expect(outline.estimatedStudyMinutes).toBe(70);
  });

  it("formats duration", () => {
    expect(formatStudyDuration(45)).toBe("45 min");
    expect(formatStudyDuration(90)).toBe("1 h 30 min");
  });
});
