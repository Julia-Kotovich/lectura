"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export function LectureForm() {
  const router = useRouter();
  const createLecture = trpc.lecture.create.useMutation();
  const generateOutline = trpc.outline.generate.useMutation();

  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const lecture = await createLecture.mutateAsync(form);
      await generateOutline.mutateAsync({ lectureId: lecture.id });
      router.push(`/lectures/${lecture.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lecture");
    }
  }

  const loading = createLecture.isPending || generateOutline.isPending;

  return (
    <Card className="max-w-2xl p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New lecture</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Describe your lecture — we will generate an editable outline and slides.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            required
            placeholder="Quality Engineering — testing and program analysis"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description (optional)</label>
          <Textarea
            placeholder="Cover structural testing, quality processes, and analysis techniques..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Generating outline…" : "Create & generate outline"}
        </Button>
      </form>
    </Card>
  );
}
