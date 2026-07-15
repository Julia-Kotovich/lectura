import { describe, expect, it } from "vitest";
import { exportDeckToPdf } from "./pdf-exporter";

describe("exportDeckToPdf", () => {
  it("returns a non-empty PDF buffer", async () => {
    const buffer = await exportDeckToPdf("Test", [
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
    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
  });
});
