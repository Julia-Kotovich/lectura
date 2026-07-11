import { describe, expect, it } from "vitest";
import {
  closeTruncatedJson,
  extractJsonCandidate,
  parseJsonLoose,
  stripTrailingCommas,
} from "./json";

describe("parseJsonLoose", () => {
  it("parses plain JSON", () => {
    expect(parseJsonLoose('{"a":1}')).toEqual({ a: 1 });
  });

  it("strips fences and prose", () => {
    expect(parseJsonLoose('Here you go:\n```json\n{"a":1}\n```\nthanks')).toEqual({ a: 1 });
  });

  it("fixes trailing commas", () => {
    expect(parseJsonLoose('{"a":[1,2,],}')).toEqual({ a: [1, 2] });
  });

  it("closes truncated objects", () => {
    const repaired = closeTruncatedJson('{"a":1,"b":[1,2');
    expect(JSON.parse(repaired)).toEqual({ a: 1, b: [1, 2] });
  });

  it("handles truncated array element error style payloads", () => {
    const bad = `{
  "alignmentScore": 70,
  "dominantLevel": "understand",
  "distribution": {
    "remember": 10,
    "understand": 40,
    "apply": 30,
    "analyze": 10,
    "evaluate": 5,
    "create": 5
  },
  "objectiveAlignments": [
    {
      "objective": "Apply concepts",
      "expectedLevel": "apply",
      "observedLevel": "understand",
      "status": "partially_aligned",
      "rationale": "Examples are present,"
    },
  ],
  "gaps": ["More analyze tasks",],
  "suggestions": ["Add a comparison slide"]
}`;
    expect(parseJsonLoose(bad)).toMatchObject({ alignmentScore: 70 });
  });
});

describe("helpers", () => {
  it("extracts first object", () => {
    expect(extractJsonCandidate('note {"x":1} trailing')).toBe('{"x":1}');
  });

  it("strips trailing commas", () => {
    expect(stripTrailingCommas("[1,2,]")).toBe("[1,2]");
  });
});
