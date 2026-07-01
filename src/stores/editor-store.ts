import { create } from "zustand";
import type { SlideDocument } from "@/lib/schemas/slide";

interface EditorState {
  selectedSlideId: string | null;
  isGenerating: boolean;
  presentationMode: boolean;
  setSelectedSlideId: (id: string | null) => void;
  setIsGenerating: (value: boolean) => void;
  setPresentationMode: (value: boolean) => void;
  localSlides: SlideDocument[];
  setLocalSlides: (slides: SlideDocument[]) => void;
  updateLocalSlide: (slide: SlideDocument) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedSlideId: null,
  isGenerating: false,
  presentationMode: false,
  localSlides: [],
  setSelectedSlideId: (id) => set({ selectedSlideId: id }),
  setIsGenerating: (value) => set({ isGenerating: value }),
  setPresentationMode: (value) => set({ presentationMode: value }),
  setLocalSlides: (slides) =>
    set({
      localSlides: slides,
      selectedSlideId: slides[0]?.id ?? null,
    }),
  updateLocalSlide: (slide) =>
    set((state) => ({
      localSlides: state.localSlides.map((s) =>
        s.id === slide.id ? slide : s,
      ),
    })),
}));
