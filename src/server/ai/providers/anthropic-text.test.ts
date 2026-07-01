import { describe, expect, it } from "vitest";
import { extractJsonContent } from "./anthropic-text";

describe("extractJsonContent", () => {
  it("returns plain JSON as-is", () => {
    expect(extractJsonContent('{"a":1}')).toBe('{"a":1}');
  });

  it("strips markdown fences", () => {
    expect(extractJsonContent('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });
});
