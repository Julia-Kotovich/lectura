"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";

export function VersionPanel({ lectureId }: { lectureId: string }) {
  const { data: versions, refetch } = trpc.versions.listDeck.useQuery({ lectureId });
  const restore = trpc.versions.restoreDeck.useMutation();
  const save = trpc.versions.saveDeck.useMutation();

  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Deck history</h3>
        <Button
          size="sm"
          variant="outline"
          disabled={save.isPending}
          onClick={() => save.mutate({ lectureId })}
        >
          Save snapshot
        </Button>
      </div>
      <ul className="space-y-1 text-sm">
        {versions?.map((v) => (
          <li key={v.id} className="flex items-center justify-between gap-2">
            <span>Version {v.version}</span>
            <Button
              size="sm"
              variant="ghost"
              disabled={restore.isPending}
              onClick={async () => {
                await restore.mutateAsync({ lectureId, versionId: v.id });
                window.location.reload();
              }}
            >
              Restore
            </Button>
          </li>
        ))}
        {!versions?.length && (
          <p className="text-xs text-zinc-400">Snapshots created before slide regeneration</p>
        )}
      </ul>
    </div>
  );
}
