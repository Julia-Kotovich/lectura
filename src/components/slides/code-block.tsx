"use client";

import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

export function CodeBlock({
  code,
  language = "typescript",
}: {
  code: string;
  language?: string;
}) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    codeToHtml(code, {
      lang: language,
      theme: "github-dark",
    }).then((result) => {
      if (!cancelled) setHtml(result);
    });
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  if (!html) {
    return (
      <pre className="overflow-auto rounded-lg bg-zinc-950 p-4 text-sm text-emerald-400">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="overflow-auto rounded-lg text-sm [&_pre]:!bg-zinc-950 [&_pre]:p-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
