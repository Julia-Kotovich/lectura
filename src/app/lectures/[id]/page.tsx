import { AppShell } from "@/components/layout/app-shell";
import { SlideEditor } from "@/components/slides/slide-editor";

export default async function LecturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <SlideEditor lectureId={id} />
    </AppShell>
  );
}
