import { describe, expect, it } from "vitest";
import {
  buildCourseCqiMetrics,
  buildLectureCqiMetrics,
  computeDeliveryQualityProxy,
  computeLectureReadinessScore,
  computeProgressionCoherence,
  computeSyllabusCoverage,
  interpretCqiScore,
} from "./v1";

describe("CQI v1", () => {
  it("computes LRS with documented weights", () => {
    const lrs = computeLectureReadinessScore({
      bloomAlignment: 80,
      objectiveCoverage: 90,
      topicCoverage: 85,
      activeLearningRatio: 40,
      deliveryQuality: 95,
    });
    expect(lrs).toBe(Math.round(0.35 * 80 + 0.25 * 90 + 0.2 * 85 + 0.1 * 40 + 0.1 * 95));
  });

  it("interprets academic bands", () => {
    expect(interpretCqiScore(90)).toBe("excellent");
    expect(interpretCqiScore(75)).toBe("good");
    expect(interpretCqiScore(60)).toBe("adequate");
    expect(interpretCqiScore(40)).toBe("needs_redesign");
  });

  it("penalizes heavy slides in DQP", () => {
    const heavy = computeDeliveryQualityProxy([
      {
        title: "Concept",
        layout: "content",
        blocks: [{ type: "text", content: "word ".repeat(250) }],
        speakerNotes: "x".repeat(50),
      },
    ]);
    expect(heavy.score).toBeLessThan(100);
  });

  it("computes syllabus coverage from topics", () => {
    expect(
      computeSyllabusCoverage(
        ["inheritance", "polymorphism"],
        ["inheritance concepts", "other"],
      ),
    ).toBe(50);
  });

  it("penalizes bloom regressions in progression", () => {
    expect(computeProgressionCoherence([80, 60])).toBe(90);
    expect(computeProgressionCoherence([80, 79])).toBe(100);
  });

  it("builds course CQI bundle", () => {
    const course = buildCourseCqiMetrics({
      lectures: [
        {
          number: 1,
          title: "Intro",
          metrics: buildLectureCqiMetrics({
            bloomAlignment: 72,
            objectiveCoverage: 80,
            topicCoverage: 85,
            activeLearningRatio: 35,
            deliveryQuality: 90,
          }),
        },
      ],
      planTopics: ["intro", "oop"],
      coveredTopics: ["intro"],
    });
    expect(course.courseQualityIndex).toBeGreaterThan(0);
    expect(course.lectureScores).toHaveLength(1);
  });
});
