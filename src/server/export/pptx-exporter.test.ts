import { describe, expect, it } from "vitest";
import { exportDeckToPptx } from "./pptx-exporter";

describe("exportDeckToPptx", () => {
  it("returns a non-empty buffer", async () => {
    const buffer = await exportDeckToPptx("Test", [
      {
        id: "1",
        title: "Hello",
        layout: "content",
        blocks: [
          { id: "b1", type: "heading", content: "Hello" },
          { id: "b2", type: "bullets", content: { items: ["A", "B"] } },
        ],
        speakerNotes: "Note",
      },
    ]);
    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.subarray(0, 2).toString()).toBe("PK");
  });
});
