"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SharePanel({ lectureId }: { lectureId: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"VIEWER" | "EDITOR">("VIEWER");
  const share = trpc.share.invite.useMutation();

  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h3 className="mb-3 text-sm font-medium">Share lecture</h3>
      <div className="flex flex-wrap gap-2">
        <Input
          type="email"
          placeholder="colleague@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-[200px] flex-1"
        />
        <select
          className="h-10 rounded-lg border border-zinc-200 px-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          value={role}
          onChange={(e) => setRole(e.target.value as "VIEWER" | "EDITOR")}
        >
          <option value="VIEWER">Viewer</option>
          <option value="EDITOR">Editor</option>
        </select>
        <Button
          disabled={share.isPending || !email}
          onClick={() => share.mutate({ lectureId, email, role })}
        >
          Invite
        </Button>
      </div>
      {share.isSuccess && (
        <p className="mt-2 text-xs text-emerald-600">Invitation saved</p>
      )}
    </div>
  );
}
