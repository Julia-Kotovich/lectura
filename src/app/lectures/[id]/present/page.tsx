"use client";

import { slideDocumentSchema } from "@/lib/schemas/slide";
import { trpc } from "@/lib/trpc/client";
import { PresentationMode } from "@/components/slides/presentation-mode";
import { use } from "react";

export default function PresentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = trpc.lecture.get.useQuery({ id });

  if (isLoading || !data) {
    return <p className="p-8 text-zinc-500">Loading presentation…</p>;
  }

  const slides = data.slides.map((s) => slideDocumentSchema.parse(s.content));

  return (
    <PresentationMode lectureId={id} title={data.title} slides={slides} />
  );
}
