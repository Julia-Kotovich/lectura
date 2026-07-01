"use client";

import { useCallback, useEffect, useState } from "react";
import type { SlideDocument } from "@/lib/schemas/slide";
import { SlideCanvas } from "./slide-canvas";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";

export function PresentationMode({
  lectureId,
  title,
  slides,
}: {
  lectureId: string;
  title: string;
  slides: SlideDocument[];
}) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, slides.length - 1));
  }, [slides.length]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (!slide) {
    return <p className="p-8">No slides to present.</p>;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-white">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
        <div>
          <p className="text-sm text-zinc-400">{title}</p>
          <p className="text-xs text-zinc-500">
            Slide {index + 1} of {slides.length}
          </p>
        </div>
        <Link
          href={`/lectures/${lectureId}`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-zinc-800"
        >
          <X className="h-5 w-5" />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-5xl">
          <SlideCanvas slide={slide} />
          {slide.speakerNotes && (
            <p className="mt-4 text-center text-sm text-zinc-400">{slide.speakerNotes}</p>
          )}
        </div>
      </main>

      <footer className="flex items-center justify-center gap-4 border-t border-zinc-800 py-4">
        <Button variant="outline" size="icon" onClick={prev} disabled={index === 0}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={next} disabled={index === slides.length - 1}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </footer>
    </div>
  );
}
