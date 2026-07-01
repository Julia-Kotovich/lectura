"use client";

import type { SlideBlock, SlideDocument } from "@/lib/schemas/slide";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";
import { MermaidDiagram } from "./mermaid-diagram";

export function SlideCanvas({ slide }: { slide: SlideDocument }) {
  return (
    <div
      className={cn(
        "aspect-video w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-700 dark:bg-zinc-900",
        layoutClass(slide.layout),
      )}
    >
      {slide.blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

function layoutClass(layout: SlideDocument["layout"]) {
  switch (layout) {
    case "title":
      return "flex flex-col items-center justify-center text-center";
    case "split":
      return "grid grid-cols-2 gap-6 items-center";
    case "code":
      return "flex flex-col gap-4";
    case "image":
      return "flex flex-col items-center justify-center";
    default:
      return "flex flex-col gap-4 justify-center";
  }
}

function BlockRenderer({ block }: { block: SlideBlock }) {
  if (block.type === "heading") {
    return (
      <h2 className="text-2xl font-bold tracking-tight">
        {typeof block.content === "string" ? block.content : ""}
      </h2>
    );
  }

  if (block.type === "text") {
    return (
      <p className="text-lg text-zinc-600 dark:text-zinc-300">
        {typeof block.content === "string" ? block.content : ""}
      </p>
    );
  }

  if (block.type === "bullets" && typeof block.content === "object") {
    const items = block.content.items ?? [];
    return (
      <ul className="list-disc space-y-2 pl-6 text-lg">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "code" && typeof block.content === "object") {
    return (
      <CodeBlock
        code={block.content.code ?? ""}
        language={block.content.language ?? "typescript"}
      />
    );
  }

  if (block.type === "diagram" && typeof block.content === "object") {
    const mermaidSource =
      block.content.mermaid ??
      `flowchart LR\n  A[${block.content.prompt ?? "Concept"}] --> B[Example]`;
    return <MermaidDiagram chart={mermaidSource} />;
  }

  if (block.type === "image" && typeof block.content === "object") {
    const url = block.content.url;
    if (url) {
      return (
        <img
          src={url}
          alt={block.content.alt ?? "Slide visual"}
          className="max-h-48 w-full rounded-lg object-contain"
        />
      );
    }
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-zinc-300 text-sm text-zinc-500">
        {block.content.prompt ?? "Image placeholder"}
      </div>
    );
  }

  return null;
}
