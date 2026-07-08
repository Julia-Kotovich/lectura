"use client";

import { useEffect, useState, type ReactNode } from "react";
import { trpc } from "@/lib/trpc/client";
import { useEditorStore } from "@/stores/editor-store";
import { slideDocumentSchema, type SlideDocument } from "@/lib/schemas/slide";
import { lectureOutlineSchema } from "@/lib/schemas/outline";
import { formatStudyDuration } from "@/lib/lecture-timing";
import { SlideList } from "./slide-list";
import { SlideCanvas } from "./slide-canvas";
import { OutlineEditor } from "@/components/lecture/outline-editor";
import { OutlinePlanView } from "@/components/lecture/outline-plan-view";
import { ScorePanel } from "@/components/evaluation/score-panel";
import { bloomAnalysisSchema } from "@/lib/schemas/evaluation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, Presentation, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { SlideBlockEditor } from "./slide-block-editor";
import { SlideComments } from "./slide-comments";
import { VersionPanel } from "./version-panel";
import { SharePanel } from "@/components/lecture/share-panel";
import { cn } from "@/lib/utils";

type Tab = "plan" | "slides";

export function SlideEditor({ lectureId }: { lectureId: string }) {
  const { data, isLoading, refetch } = trpc.lecture.get.useQuery({ id: lectureId });
  const {
    localSlides,
    selectedSlideId,
    setLocalSlides,
    setSelectedSlideId,
    updateLocalSlide,
  } = useEditorStore();

  const [tab, setTab] = useState<Tab>("plan");
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [aiInstructions, setAiInstructions] = useState("");

  const updateSlide = trpc.slides.update.useMutation();
  const reorderSlides = trpc.slides.reorder.useMutation();
  const evaluateDeck = trpc.evaluation.evaluateDeck.useMutation();
  const improveFromBloom = trpc.evaluation.improveDeckFromBloom.useMutation();
  const regenerateImage = trpc.ai.regenerateImage.useMutation();
  const regenerateSlide = trpc.ai.regenerateSlide.useMutation();
  const exportPptx = trpc.export.getPptxBase64.useMutation();
  const generateSlides = trpc.slides.generateFromOutline.useMutation();
  const regenerateOutline = trpc.outline.generate.useMutation();

  useEffect(() => {
    if (!data) return;
    const slides = data.slides.map((s) => slideDocumentSchema.parse(s.content));
    setLocalSlides(slides);
  }, [data, setLocalSlides]);

  if (isLoading || !data) {
    return <p className="text-sm text-zinc-500">Loading lecture…</p>;
  }

  const outline = data.outlineVersions[0]?.content
    ? lectureOutlineSchema.parse(data.outlineVersions[0].content)
    : null;

  const selectedSlide = localSlides.find((s) => s.id === selectedSlideId) ?? localSlides[0];
  const slideCount = data.slides.length;
  const evaluation = data.evaluations[0];
  const hasBloomEvaluation =
    evaluation != null &&
    bloomAnalysisSchema.safeParse(
      (evaluation.feedback as { bloomAnalysis?: unknown } | null)?.bloomAnalysis,
    ).success;

  async function saveSlide(slide: SlideDocument) {
    updateLocalSlide(slide);
    await updateSlide.mutateAsync({ lectureId, slideId: slide.id, content: slide });
    await refetch();
  }

  async function handleReorder(ids: string[]) {
    const reordered = ids
      .map((id) => localSlides.find((s) => s.id === id))
      .filter(Boolean) as SlideDocument[];
    setLocalSlides(reordered);
    await reorderSlides.mutateAsync({ lectureId, slideIds: ids });
  }

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">{data.title}</h1>
          {outline?.estimatedStudyMinutes != null && (
            <p className="mt-1 text-sm text-zinc-500">
              {formatStudyDuration(outline.estimatedStudyMinutes)} study ·{" "}
              {outline.targetSlideCount ?? 10} slides · {slideCount} created
            </p>
          )}
        </div>

        <nav className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900/50">
          <TabButton active={tab === "plan"} onClick={() => setTab("plan")}>
            Lecture plan
          </TabButton>
          <TabButton active={tab === "slides"} onClick={() => setTab("slides")}>
            Slides{slideCount > 0 ? ` (${slideCount})` : ""}
          </TabButton>
        </nav>
      </header>

      {tab === "plan" && (
        <div className="space-y-4">
          {!outline ? (
            <p className="text-sm text-zinc-500">
              No plan yet. Create a lecture with outline generation first.
            </p>
          ) : (
            <>
              <OutlinePlanView outline={outline} />

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={regenerateOutline.isPending}
                  onClick={async () => {
                    await regenerateOutline.mutateAsync({ lectureId });
                    await refetch();
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                  {regenerateOutline.isPending ? "Regenerating plan…" : "Regenerate plan (AI)"}
                </Button>
              </div>

              {slideCount === 0 && (
                <Button
                  className="w-full sm:w-auto"
                  disabled={generateSlides.isPending}
                  onClick={async () => {
                    await generateSlides.mutateAsync({ lectureId });
                    setTab("slides");
                    await refetch();
                  }}
                >
                  {generateSlides.isPending
                    ? "Generating slides…"
                    : "Generate slides from plan"}
                </Button>
              )}

              <details
                open={editPlanOpen}
                onToggle={(e) => setEditPlanOpen(e.currentTarget.open)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800"
              >
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
                  Edit plan
                </summary>
                <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                  <OutlineEditor
                    key={data.outlineVersions[0]?.id ?? lectureId}
                    lectureId={lectureId}
                    initialOutline={outline}
                    embedded
                    onSlidesGenerated={() => {
                      setTab("slides");
                      void refetch();
                    }}
                  />
                </div>
              </details>
            </>
          )}
        </div>
      )}

      {tab === "slides" && (
        <div className="space-y-6">
          {evaluation && <ScorePanel evaluation={evaluation} />}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (slideCount === 0) return;
                await evaluateDeck.mutateAsync({ lectureId });
                await refetch();
              }}
              disabled={evaluateDeck.isPending || slideCount === 0}
              title={slideCount === 0 ? "Generate slides before evaluating" : undefined}
            >
              <Sparkles className="h-4 w-4" />
              Evaluate Bloom
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (slideCount === 0 || !hasBloomEvaluation) return;
                await improveFromBloom.mutateAsync({ lectureId });
                await refetch();
              }}
              disabled={
                improveFromBloom.isPending ||
                slideCount === 0 ||
                !hasBloomEvaluation ||
                evaluateDeck.isPending
              }
              title={
                !hasBloomEvaluation
                  ? "Run Evaluate Bloom first"
                  : "Regenerate all slides using Bloom gaps and suggestions"
              }
            >
              <RefreshCw className="h-4 w-4" />
              {improveFromBloom.isPending ? "Improving deck…" : "Improve deck from Bloom"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exportPptx.isPending || !slideCount}
              onClick={async () => {
                const result = await exportPptx.mutateAsync({ lectureId });
                const bytes = Uint8Array.from(atob(result.data), (c) => c.charCodeAt(0));
                const blob = new Blob([bytes], { type: result.mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = result.filename;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-4 w-4" />
              Export PPTX
            </Button>
            <Link
              href={`/lectures/${lectureId}/present`}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm font-medium",
                "hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900",
                !slideCount && "pointer-events-none opacity-50",
              )}
            >
              <Presentation className="h-4 w-4" />
              Present
            </Link>
          </div>

          {slideCount === 0 ? (
            <CardEmptySlides onOpenPlan={() => setTab("plan")} />
          ) : localSlides.length === 0 ? (
            <p className="text-sm text-zinc-500">Loading slides…</p>
          ) : selectedSlide ? (
              <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                <SlideList
                  slides={localSlides}
                  selectedId={selectedSlideId}
                  onSelect={setSelectedSlideId}
                  onReorder={handleReorder}
                />

                <div className="space-y-4">
                  <SlideCanvas slide={selectedSlide} />

                  <SlideBlockEditor
                    slide={selectedSlide}
                    onChange={updateLocalSlide}
                    onSave={saveSlide}
                    saving={updateSlide.isPending}
                  />

                  <div className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Speaker notes</label>
                      <Textarea
                        value={selectedSlide.speakerNotes ?? ""}
                        onChange={(e) =>
                          updateLocalSlide({
                            ...selectedSlide,
                            speakerNotes: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">AI instructions</label>
                      <Textarea
                        placeholder="What should change on this slide?"
                        value={aiInstructions}
                        onChange={(e) => setAiInstructions(e.target.value)}
                        className="min-h-[64px] text-sm"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={regenerateSlide.isPending}
                        onClick={async () => {
                          const slide = await regenerateSlide.mutateAsync({
                            lectureId,
                            slideId: selectedSlide.id,
                            instructions: aiInstructions.trim() || undefined,
                          });
                          updateLocalSlide(slide);
                          await refetch();
                        }}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Regenerate with AI
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveSlide(selectedSlide)}
                        disabled={updateSlide.isPending}
                      >
                        {updateSlide.isPending ? "Saving…" : "Save"}
                      </Button>
                    </div>
                  </div>

                  <details className="rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <summary className="cursor-pointer px-4 py-2 text-sm text-zinc-500">
                      Comments & sharing
                    </summary>
                    <div className="space-y-4 border-t border-zinc-200 p-4 dark:border-zinc-800">
                      <SlideComments lectureId={lectureId} slideId={selectedSlide.id} />
                      <div className="grid gap-4 lg:grid-cols-2">
                        <VersionPanel lectureId={lectureId} />
                        <SharePanel lectureId={lectureId} />
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            ) : null}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
      )}
    >
      {children}
    </button>
  );
}

function CardEmptySlides({ onOpenPlan }: { onOpenPlan: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
      <p className="text-zinc-600 dark:text-zinc-400">No slides yet.</p>
      <p className="mt-1 text-sm text-zinc-500">
        Finalize your lecture plan, then generate slides from it.
      </p>
      <Button className="mt-4" variant="secondary" onClick={onOpenPlan}>
        Go to lecture plan
      </Button>
    </div>
  );
}
