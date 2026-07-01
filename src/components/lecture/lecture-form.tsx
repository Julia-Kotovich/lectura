"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { matchesOopCourse } from "@/lib/course-frameworks/oop-bachelor";
import { OOP_BACHELOR_SLUG } from "@/lib/course-frameworks";

export function LectureForm() {
  const router = useRouter();
  const createLecture = trpc.lecture.create.useMutation();
  const generateOutline = trpc.outline.generate.useMutation();

  const [form, setForm] = useState({
    title: "",
    description: "",
    courseFrameworkSlug: "default" as "default" | "oop-bachelor",
    semesterWeek: 1,
  });

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...form,
        courseFrameworkSlug:
          form.courseFrameworkSlug === "default" ? undefined : form.courseFrameworkSlug,
      };
      const lecture = await createLecture.mutateAsync(payload);
      await generateOutline.mutateAsync({
        lectureId: lecture.id,
        courseFrameworkSlug:
          form.courseFrameworkSlug === "default" ? undefined : OOP_BACHELOR_SLUG,
        semesterWeek:
          form.courseFrameworkSlug === "oop-bachelor" ? form.semesterWeek : undefined,
      });
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
            placeholder="OOP in CS — Week 1: Introduction to OOP"
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm({
                ...form,
                title,
                courseFrameworkSlug: matchesOopCourse(title, form.description)
                  ? OOP_BACHELOR_SLUG
                  : form.courseFrameworkSlug,
              });
            }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Course framework</label>
            <select
              className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={form.courseFrameworkSlug}
              onChange={(e) =>
                setForm({
                  ...form,
                  courseFrameworkSlug: e.target.value as typeof form.courseFrameworkSlug,
                })
              }
            >
              <option value="default">General CS lecture</option>
              <option value="oop-bachelor">OOP — Bachelor semester course</option>
            </select>
          </div>
          {form.courseFrameworkSlug === "oop-bachelor" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Semester week (1–13)</label>
              <Input
                type="number"
                min={1}
                max={13}
                value={form.semesterWeek}
                onChange={(e) =>
                  setForm({ ...form, semesterWeek: Number(e.target.value) || 1 })
                }
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description (optional)</label>
          <Textarea
            placeholder="Cover processes, memory management, and scheduling basics..."
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
