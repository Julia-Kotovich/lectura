import { z } from "zod";

export const slideLayoutSchema = z.enum([
  "title",
  "content",
  "split",
  "code",
  "image",
]);

export const slideBlockTypeSchema = z.enum([
  "heading",
  "text",
  "bullets",
  "code",
  "image",
  "diagram",
  "quote",
]);

export const slideBlockSchema = z.object({
  id: z.string(),
  type: slideBlockTypeSchema,
  content: z.union([
    z.string(),
    z.object({
      items: z.array(z.string()).optional(),
      language: z.string().optional(),
      code: z.string().optional(),
      prompt: z.string().optional(),
      url: z.string().optional(),
      alt: z.string().optional(),
      mermaid: z.string().optional(),
    }),
  ]),
});

export const slideDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  layout: slideLayoutSchema.default("content"),
  blocks: z.array(slideBlockSchema),
  speakerNotes: z.string().optional(),
  metadata: z
    .object({
      transition: z.string().optional(),
      animation: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .optional(),
});

export const slideDeckDraftSchema = z.object({
  slides: z.array(slideDocumentSchema),
});

export type SlideLayout = z.infer<typeof slideLayoutSchema>;
export type SlideBlock = z.infer<typeof slideBlockSchema>;
export type SlideDocument = z.infer<typeof slideDocumentSchema>;
export type SlideDeckDraft = z.infer<typeof slideDeckDraftSchema>;
