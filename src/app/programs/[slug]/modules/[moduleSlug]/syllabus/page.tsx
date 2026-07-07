import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { getProgram } from "@/lib/curriculum";

export default async function ProgramModuleSyllabusPage({
  params,
}: {
  params: Promise<{ slug: string; moduleSlug: string }>;
}) {
  const { slug, moduleSlug } = await params;
  const program = getProgram(slug);
  const programModule = program?.modules.find((item) => item.slug === moduleSlug);

  if (!program || !programModule || !programModule.syllabusPath) {
    return (
      <AppShell>
        <p className="text-sm text-zinc-500">Syllabus not found.</p>
      </AppShell>
    );
  }

  const markdown = await readFile(join(process.cwd(), programModule.syllabusPath), "utf8");

  return (
    <AppShell>
      <Link
        href={`/programs/${slug}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to program
      </Link>

      <header className="mb-6 space-y-2">
        <p className="text-xs uppercase tracking-wide text-zinc-500">English syllabus</p>
        <h1 className="text-3xl font-semibold tracking-tight">{programModule.title}</h1>
        <p className="text-sm text-zinc-500">
          {programModule.code} · Semester {programModule.semester} · {programModule.cp} CP ·{" "}
          {programModule.track}
        </p>
      </header>

      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-zinc-500">{program.title}</span>
          <span className="text-zinc-300">/</span>
          <Link
            href={`/programs/${slug}`}
            className="inline-flex items-center gap-1 text-violet-600 hover:underline"
          >
            Module card
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <article className="max-w-4xl space-y-4 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{children}</h1>,
              h2: ({ children }) => <h2 className="mt-8 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{children}</h2>,
              h3: ({ children }) => <h3 className="mt-6 text-base font-semibold text-zinc-900 dark:text-zinc-50">{children}</h3>,
              p: ({ children }) => <p>{children}</p>,
              ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{children}</strong>,
              code: ({ children }) => (
                <code className="rounded bg-zinc-100 px-1 py-0.5 text-[0.9em] dark:bg-zinc-800">
                  {children}
                </code>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-600 underline underline-offset-2"
                >
                  {children}
                </a>
              ),
            }}
          >
            {markdown}
          </ReactMarkdown>
        </article>
      </Card>
    </AppShell>
  );
}
