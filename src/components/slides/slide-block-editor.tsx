"use client";

import { nanoid } from "nanoid";
import type { SlideBlock, SlideDocument, SlideLayout } from "@/lib/schemas/slide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Trash2 } from "lucide-react";

const layouts: { value: SlideLayout; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "content", label: "Content" },
  { value: "split", label: "Split" },
  { value: "code", label: "Code" },
  { value: "image", label: "Image" },
];

const blockTypes = [
  { value: "heading", label: "Heading" },
  { value: "text", label: "Text" },
  { value: "bullets", label: "Bullets" },
  { value: "code", label: "Code" },
  { value: "quote", label: "Quote" },
  { value: "diagram", label: "Diagram" },
] as const;

export function SlideBlockEditor({
  slide,
  onChange,
  onSave,
  saving,
}: {
  slide: SlideDocument;
  onChange: (slide: SlideDocument) => void;
  onSave: (slide: SlideDocument) => void | Promise<void>;
  saving?: boolean;
}) {
  function updateBlock(index: number, block: SlideBlock) {
    const blocks = [...slide.blocks];
    blocks[index] = block;
    onChange({ ...slide, blocks });
  }

  function removeBlock(index: number) {
    onChange({ ...slide, blocks: slide.blocks.filter((_, i) => i !== index) });
  }

  function addBlock(type: (typeof blockTypes)[number]["value"]) {
    const id = nanoid();
    let content: SlideBlock["content"] = "";
    if (type === "bullets") content = { items: ["New point"] };
    if (type === "code") content = { language: "typescript", code: "// code" };
    if (type === "diagram") content = { prompt: "Diagram description" };
    onChange({
      ...slide,
      blocks: [...slide.blocks, { id, type, content }],
    });
  }

  return (
    <details className="group rounded-xl border border-zinc-200 dark:border-zinc-800">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-3 marker:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-90" />
          <h3 className="text-sm font-semibold">Edit slide content</h3>
        </div>
        <span className="text-xs text-zinc-500">
          {layouts.find((layout) => layout.value === slide.layout)?.label ?? slide.layout} layout ·{" "}
          {slide.blocks.length} block{slide.blocks.length === 1 ? "" : "s"}
        </span>
      </summary>

      <div className="space-y-4 border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex justify-end">
          <Button size="sm" onClick={() => onSave(slide)} disabled={saving}>
            {saving ? "Saving…" : "Save slide"}
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Layout</label>
          <select
            className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={slide.layout}
            onChange={(e) => onChange({ ...slide, layout: e.target.value as SlideLayout })}
          >
            {layouts.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {slide.blocks.map((block, index) => (
            <div
              key={block.id}
              className="space-y-2 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {block.type}
                </span>
                <button
                  type="button"
                  onClick={() => removeBlock(index)}
                  className="text-zinc-400 hover:text-red-600"
                  aria-label="Remove block"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <BlockFields block={block} onUpdate={(b) => updateBlock(index, b)} />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {blockTypes.map((t) => (
            <Button key={t.value} type="button" size="sm" variant="outline" onClick={() => addBlock(t.value)}>
              + {t.label}
            </Button>
          ))}
        </div>
      </div>
    </details>
  );
}

function BlockFields({
  block,
  onUpdate,
}: {
  block: SlideBlock;
  onUpdate: (block: SlideBlock) => void;
}) {
  if (block.type === "heading" || block.type === "text" || block.type === "quote") {
    return (
      <Textarea
        className="min-h-[60px] text-sm"
        value={typeof block.content === "string" ? block.content : ""}
        onChange={(e) => onUpdate({ ...block, content: e.target.value })}
      />
    );
  }

  if (block.type === "bullets" && typeof block.content === "object") {
    const text = (block.content.items ?? []).join("\n");
    return (
      <div className="space-y-1">
        <p className="text-xs text-zinc-500">One bullet per line</p>
        <Textarea
          className="min-h-[100px] font-mono text-sm"
          value={text}
          onChange={(e) =>
            onUpdate({
              ...block,
              content: {
                ...block.content,
                items: e.target.value.split("\n").filter((line) => line.trim()),
              },
            })
          }
        />
      </div>
    );
  }

  if (block.type === "code" && typeof block.content === "object") {
    return (
      <div className="space-y-2">
        <Input
          placeholder="Language (e.g. python)"
          value={block.content.language ?? ""}
          onChange={(e) =>
            onUpdate({
              ...block,
              content: { ...block.content, language: e.target.value },
            })
          }
        />
        <Textarea
          className="min-h-[120px] font-mono text-xs"
          value={block.content.code ?? ""}
          onChange={(e) =>
            onUpdate({
              ...block,
              content: { ...block.content, code: e.target.value },
            })
          }
        />
      </div>
    );
  }

  if ((block.type === "diagram" || block.type === "image") && typeof block.content === "object") {
    return (
      <div className="space-y-2">
        <Textarea
          className="min-h-[60px] text-sm"
          placeholder="Visual description / prompt"
          value={block.content.prompt ?? ""}
          onChange={(e) =>
            onUpdate({
              ...block,
              content: { ...block.content, prompt: e.target.value },
            })
          }
        />
        {block.type === "diagram" && (
          <Textarea
            className="min-h-[80px] font-mono text-xs"
            placeholder="Mermaid diagram (optional)"
            value={block.content.mermaid ?? ""}
            onChange={(e) =>
              onUpdate({
                ...block,
                content: { ...block.content, mermaid: e.target.value },
              })
            }
          />
        )}
      </div>
    );
  }

  return (
    <Textarea
      className="text-sm"
      value={typeof block.content === "string" ? block.content : JSON.stringify(block.content)}
      onChange={(e) => onUpdate({ ...block, content: e.target.value })}
    />
  );
}
