"use client";

import { useState } from "react";
import type { LectureOutline } from "@/lib/schemas/outline";
import { formatStudyDuration } from "@/lib/lecture-timing";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function OutlineEditor({
  lectureId,
  initialOutline,
  embedded,
  onSlidesGenerated,
}: {
  lectureId: string;
  initialOutline: LectureOutline;
  embedded?: boolean;
  onSlidesGenerated?: () => void;
}) {
  const [outline, setOutline] = useState(initialOutline);
  const [jsonMode, setJsonMode] = useState(false);
  const [rawJson, setRawJson] = useState(JSON.stringify(initialOutline, null, 2));
  const [saved, setSaved] = useState(false);

  const updateOutline = trpc.outline.update.useMutation();
  const generateSlides = trpc.slides.generateFromOutline.useMutation();

  async function handleSave() {
    const content = jsonMode ? (JSON.parse(rawJson) as LectureOutline) : outline;
    await updateOutline.mutateAsync({ lectureId, content });
    if (jsonMode) setOutline(content);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleGenerateSlides() {
    await handleSave();
    await generateSlides.mutateAsync({ lectureId });
    if (onSlidesGenerated) {
      onSlidesGenerated();
    } else {
      window.location.reload();
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Lecture outline</h2>
          <p className="text-sm text-zinc-500">
            ~{outline.targetSlideCount ?? 10} slides ·{" "}
            {outline.estimatedStudyMinutes
              ? `${formatStudyDuration(outline.estimatedStudyMinutes)} study`
              : "study time after save"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setJsonMode(!jsonMode)}>
          {jsonMode ? "Visual editor" : "JSON"}
        </Button>
      </div>

      {jsonMode ? (
        <Textarea
          className="min-h-[400px] font-mono text-xs"
          value={rawJson}
          onChange={(e) => setRawJson(e.target.value)}
        />
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Summary</label>
            <Textarea
              value={outline.summary}
              onChange={(e) => setOutline({ ...outline, summary: e.target.value })}
            />
          </div>

          <StringListEditor
            label="Learning objectives"
            items={outline.learningObjectives}
            onChange={(learningObjectives) => setOutline({ ...outline, learningObjectives })}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Sections</label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setOutline({
                    ...outline,
                    sections: [
                      ...outline.sections,
                      {
                        title: "New section",
                        learningGoals: ["Learning goal"],
                        subsections: [{ title: "Topic", keyPoints: ["Key point"] }],
                      },
                    ],
                  })
                }
              >
                <Plus className="h-3 w-3" />
                Add section
              </Button>
            </div>

            {outline.sections.map((section, si) => (
              <div
                key={si}
                className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-3">
                    <Input
                      value={section.title}
                      onChange={(e) => {
                        const sections = [...outline.sections];
                        sections[si] = { ...section, title: e.target.value };
                        setOutline({ ...outline, sections });
                      }}
                      placeholder="Section title"
                    />
                    <StringListEditor
                      label="Learning goals"
                      items={section.learningGoals}
                      compact
                      onChange={(learningGoals) => {
                        const sections = [...outline.sections];
                        sections[si] = { ...section, learningGoals };
                        setOutline({ ...outline, sections });
                      }}
                    />
                    {section.subsections.map((sub, subIdx) => (
                      <div
                        key={subIdx}
                        className="space-y-2 rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
                      >
                        <Input
                          value={sub.title}
                          onChange={(e) => {
                            const sections = [...outline.sections];
                            const subsections = [...section.subsections];
                            subsections[subIdx] = { ...sub, title: e.target.value };
                            sections[si] = { ...section, subsections };
                            setOutline({ ...outline, sections });
                          }}
                          placeholder="Subsection title"
                        />
                        <StringListEditor
                          label="Key points"
                          items={sub.keyPoints}
                          compact
                          onChange={(keyPoints) => {
                            const sections = [...outline.sections];
                            const subsections = [...section.subsections];
                            subsections[subIdx] = { ...sub, keyPoints };
                            sections[si] = { ...section, subsections };
                            setOutline({ ...outline, sections });
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const sections = [...outline.sections];
                        sections[si] = {
                          ...section,
                          subsections: [
                            ...section.subsections,
                            { title: "New topic", keyPoints: ["Point"] },
                          ],
                        };
                        setOutline({ ...outline, sections });
                      }}
                    >
                      + Subsection
                    </Button>
                  </div>
                  <button
                    type="button"
                    className="text-zinc-400 hover:text-red-600"
                    onClick={() =>
                      setOutline({
                        ...outline,
                        sections: outline.sections.filter((_, i) => i !== si),
                      })
                    }
                    aria-label="Remove section"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {outline.suggestedResources && (
            <StringListEditor
              label="Suggested resources"
              items={outline.suggestedResources}
              onChange={(suggestedResources) => setOutline({ ...outline, suggestedResources })}
            />
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={handleSave} disabled={updateOutline.isPending}>
          {updateOutline.isPending ? "Saving…" : "Save outline"}
        </Button>
        <Button onClick={handleGenerateSlides} disabled={generateSlides.isPending}>
          {generateSlides.isPending ? "Generating slides…" : "Generate slides from plan"}
        </Button>
        {saved && <span className="text-sm text-green-600">Saved</span>}
      </div>
    </Card>
  );
}

function StringListEditor({
  label,
  items,
  onChange,
  compact,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  compact?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className={compact ? "text-xs font-medium text-zinc-500" : "text-sm font-medium"}>
          {label}
        </label>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onChange([...items, ""])}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            className="text-zinc-400 hover:text-red-600"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
