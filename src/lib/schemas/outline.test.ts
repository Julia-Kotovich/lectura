import { describe, expect, it } from "vitest";
import { lectureOutlineSchema } from "./outline";

describe("lectureOutlineSchema", () => {
  it("validates minimal outline", () => {
    const outline = lectureOutlineSchema.parse({
      title: "Test Lecture",
      summary: "Summary",
      learningObjectives: ["Goal 1"],
      sections: [
        {
          title: "Section 1",
          learningGoals: ["Learn X"],
          subsections: [{ title: "Sub", keyPoints: ["Point"] }],
        },
      ],
    });
    expect(outline.title).toBe("Test Lecture");
  });
});
