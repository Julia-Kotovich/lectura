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
import {
  BLOOM_MAX_IMPROVE_ROUNDS,
  BLOOM_TARGET_SCORE,
} from "@/lib/bloom/problem-slides";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Download, Presentation, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { SlideBlockEditor } from "./slide-block-editor";
import { SlideComments } from "./slide-comments";
import { SharePanel } from "@/components/lecture/share-panel";
import { cn } from "@/lib/utils";

type Tab = "plan" | "slides";

type ExportResult = {
  data: string;
  filename: string;
  mimeType: string;
};

function downloadBase64File(result: ExportResult) {
  const bytes = Uint8Array.from(atob(result.data), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: result.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = result.filename;
  a.click();
  URL.revokeObjectURL(url);
}

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
  const [trackImprove, setTrackImprove] = useState(false);

  const updateSlide = trpc.slides.update.useMutation();
  const reorderSlides = trpc.slides.reorder.useMutation();
  const evaluateDeck = trpc.evaluation.evaluateDeck.useMutation();
  const improveAndReevaluate = trpc.evaluation.improveAndReevaluate.useMutation();
  const { data: bloomHistory } = trpc.evaluation.listBloomHistory.useQuery({ lectureId });
  const { data: improveProgress } = trpc.evaluation.getImproveProgress.useQuery(
    { lectureId },
    {
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (improveAndReevaluate.isPending || status === "running" || trackImprove) return 800;
        return false;
      },
    },
  );
  const regenerateSlide = trpc.ai.regenerateSlide.useMutation();
  const exportPptx = trpc.export.getPptxBase64.useMutation();
  const exportPdf = trpc.export.getPdfBase64.useMutation();
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
  const evaluations = data.evaluations ?? [];
  const evaluation = evaluations[0];
  const hasBloomEvaluation =
    evaluation != null &&
    bloomAnalysisSchema.safeParse(
      (evaluation.feedback as { bloomAnalysis?: unknown } | null)?.bloomAnalysis,
    ).success;
  const latestBloom = hasBloomEvaluation
    ? bloomAnalysisSchema.parse(
        (evaluation.feedback as { bloomAnalysis?: unknown }).bloomAnalysis,
      )
    : null;
  const improveRounds = improveProgress?.roundsUsed ?? 0;
  const atTarget = (latestBloom?.alignmentScore ?? 0) >= BLOOM_TARGET_SCORE;
  const atLimit = improveRounds >= BLOOM_MAX_IMPROVE_ROUNDS;
  const improveBusy = improveAndReevaluate.isPending || improveProgress?.status === "running";

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

  async function runImproveAndReevaluate() {
    if (slideCount === 0 || !hasBloomEvaluation || atTarget || atLimit) return;
    setTrackImprove(true);
    try {
      await improveAndReevaluate.mutateAsync({ lectureId, reevaluate: true });
      await refetch();
    } finally {
      setTrackImprove(false);
    }
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
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (slideCount === 0) return;
                await evaluateDeck.mutateAsync({ lectureId });
                await refetch();
              }}
              disabled={evaluateDeck.isPending || slideCount === 0 || improveBusy}
              title={slideCount === 0 ? "Generate slides before evaluating" : undefined}
            >
              <Sparkles className="h-4 w-4" />
              Evaluate Bloom
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void runImproveAndReevaluate()}
              disabled={
                improveBusy ||
                slideCount === 0 ||
                !hasBloomEvaluation ||
                evaluateDeck.isPending ||
                atTarget ||
                atLimit
              }
              title={
                !hasBloomEvaluation
                  ? "Run Evaluate Bloom first"
                  : atTarget
                    ? `Already at target (≥ ${BLOOM_TARGET_SCORE})`
                    : atLimit
                      ? `Improve limit reached (${BLOOM_MAX_IMPROVE_ROUNDS})`
                      : "Improve problem slides, then re-evaluate Bloom"
              }
            >
              <RefreshCw className="h-4 w-4" />
              {improveBusy
                ? improveProgress?.phase === "reevaluating"
                  ? "Re-evaluating…"
                  : improveProgress?.total
                    ? `Improving ${improveProgress.current}/${improveProgress.total}…`
                    : "Improving…"
                : "Improve & re-evaluate"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exportPptx.isPending || !slideCount}
              onClick={async () => {
                const result = await exportPptx.mutateAsync({ lectureId });
                downloadBase64File(result);
              }}
            >
              <Download className="h-4 w-4" />
              Export PPTX
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exportPdf.isPending || !slideCount}
              onClick={async () => {
                const result = await exportPdf.mutateAsync({ lectureId });
                downloadBase64File(result);
              }}
            >
              <Download className="h-4 w-4" />
              Export PDF
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

                  <details className="group rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-3 marker:hidden">
                      <div className="flex min-w-0 items-center gap-2">
                        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-90" />
                        <h3 className="text-sm font-semibold">Speaker notes</h3>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {selectedSlide.speakerNotes?.trim() ? "Notes added" : "No notes"}
                      </span>
                    </summary>
                    <div className="space-y-3 border-t border-zinc-200 p-4 dark:border-zinc-800">
                      <p className="text-sm text-zinc-500">
                        Private presenter notes for this slide. They are saved with the slide and exported as
                        presenter notes where supported.
                      </p>
                      <Textarea
                        value={selectedSlide.speakerNotes ?? ""}
                        onChange={(e) =>
                          updateLocalSlide({
                            ...selectedSlide,
                            speakerNotes: e.target.value,
                          })
                        }
                      />
                      <Button
                        size="sm"
                        onClick={() => saveSlide(selectedSlide)}
                        disabled={updateSlide.isPending}
                      >
                        {updateSlide.isPending ? "Saving…" : "Save notes"}
                      </Button>
                    </div>
                  </details>

                  <SlideBlockEditor
                    slide={selectedSlide}
                    onChange={updateLocalSlide}
                    onSave={saveSlide}
                    saving={updateSlide.isPending}
                  />

                  <details className="group rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-3 marker:hidden">
                      <div className="flex min-w-0 items-center gap-2">
                        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-90" />
                        <h3 className="text-sm font-semibold">Edit slide with AI</h3>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {aiInstructions.trim() ? "Custom prompt ready" : "Optional"}
                      </span>
                    </summary>
                    <div className="space-y-3 border-t border-zinc-200 p-4 dark:border-zinc-800">
                      <p className="text-sm text-zinc-500">
                        Temporary instructions for regenerating only the currently selected slide with AI.
                        They are not saved as slide content.
                      </p>
                      <Textarea
                        placeholder="What should change on this slide?"
                        value={aiInstructions}
                        onChange={(e) => setAiInstructions(e.target.value)}
                        className="min-h-[64px] text-sm"
                      />
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
                    </div>
                  </details>

                  <details className="group rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-3 marker:hidden">
                      <div className="flex min-w-0 items-center gap-2">
                        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-90" />
                        <h3 className="text-sm font-semibold">Sharing</h3>
                      </div>
                      <span className="text-xs text-zinc-500">Invite viewer or editor</span>
                    </summary>
                    <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                      <SharePanel lectureId={lectureId} />
                    </div>
                  </details>

                  <details className="group rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-3 marker:hidden">
                      <div className="flex min-w-0 items-center gap-2">
                        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-90" />
                        <h3 className="text-sm font-semibold">Comments</h3>
                      </div>
                      <span className="text-xs text-zinc-500">Selected slide discussion</span>
                    </summary>
                    <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                      <SlideComments lectureId={lectureId} slideId={selectedSlide.id} />
                    </div>
                  </details>
                </div>
              </div>
            ) : null}

          {evaluation && (
            <ScorePanel
              evaluation={evaluation}
              history={bloomHistory ?? []}
              progress={improveProgress}
              improveRounds={improveRounds}
            />
          )}
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
