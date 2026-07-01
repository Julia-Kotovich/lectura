"use client";

import { useEffect, useRef, useState } from "react";

export function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({ startOnLoad: false, theme: "dark" });
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled) setSvg(svg);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    }
    render();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-400 p-4 text-xs text-zinc-500">
        Mermaid: {chart}
      </div>
    );
  }

  if (!svg) {
    return <div className="h-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />;
  }

  return (
    <div
      ref={ref}
      className="flex justify-center overflow-auto rounded-lg bg-white p-2 dark:bg-zinc-900"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
