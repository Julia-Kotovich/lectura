"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function TemplatesPage() {
  const router = useRouter();
  const { data: templates, isLoading } = trpc.templates.list.useQuery();
  const createFromTemplate = trpc.templates.createLecture.useMutation();

  async function useTemplate(slug: string) {
    const lecture = await createFromTemplate.mutateAsync({ templateSlug: slug });
    router.push(`/lectures/${lecture.id}`);
  }

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Lecture templates</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Start from a curated CS curriculum outline
        </p>
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates?.map((t) => (
          <li key={t.id}>
            <Card className="flex h-full flex-col p-5">
              <Badge className="mb-2 w-fit">{t.category}</Badge>
              <h2 className="font-semibold">{t.title}</h2>
              <p className="mt-1 flex-1 text-sm text-zinc-500">{t.description}</p>
              <button
                type="button"
                onClick={() => useTemplate(t.slug)}
                disabled={createFromTemplate.isPending}
                className="mt-4 text-sm font-medium text-violet-600 hover:underline"
              >
                Use template →
              </button>
            </Card>
          </li>
        ))}
      </ul>

      {!isLoading && !templates?.length && (
        <p className="text-sm text-zinc-500">
          No templates yet. Run <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">npm run db:seed</code>
        </p>
      )}
    </AppShell>
  );
}
