import { describe, expect, it } from "vitest";
import { shouldRevertBloomImprove } from "./problem-slides";

describe("shouldRevertBloomImprove", () => {
  it("reverts when re-evaluated score drops", () => {
    expect(shouldRevertBloomImprove(82, 78, true)).toBe(true);
  });

  it("keeps improvement when score rises or stays flat", () => {
    expect(shouldRevertBloomImprove(72, 78, true)).toBe(false);
    expect(shouldRevertBloomImprove(78, 78, true)).toBe(false);
  });

  it("does not revert when re-evaluation was skipped", () => {
    expect(shouldRevertBloomImprove(82, 78, false)).toBe(false);
  });
});
