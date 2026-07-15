"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function SlideComments({
  lectureId,
  slideId,
}: {
  lectureId: string;
  slideId: string;
}) {
  const [body, setBody] = useState("");
  const { data: comments, refetch } = trpc.comments.list.useQuery({
    lectureId,
    slideId,
  });
  const addComment = trpc.comments.add.useMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    await addComment.mutateAsync({ lectureId, slideId, body });
    setBody("");
    await refetch();
  }

  return (
    <div className="space-y-3">
      <ul className="max-h-40 space-y-2 overflow-y-auto text-sm">
        {comments?.map((c) => (
          <li key={c.id} className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900">
            <p className="text-xs text-zinc-500">{c.user.name ?? c.user.email}</p>
            <p>{c.body}</p>
          </li>
        ))}
        {!comments?.length && (
          <p className="text-xs text-zinc-400">No comments yet</p>
        )}
      </ul>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add feedback…"
          className="min-h-[60px] flex-1"
        />
        <Button type="submit" size="sm" disabled={addComment.isPending}>
          Post
        </Button>
      </form>
    </div>
  );
}
