import { notFound, redirect } from "next/navigation";
import { Frame } from "@/components/frame";
import { IntakeForm } from "@/components/intake-form";
import { loadOwnedAssessment } from "@/lib/assessments";

export default async function AngelIntakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, row } = await loadOwnedAssessment(id);
  if (!user) redirect("/angel");
  if (!row) notFound();
  if (row.status === "followup") redirect(`/angel/a/${id}/follow-up`);
  if (row.status === "complete") redirect(`/angel/a/${id}/report`);

  return (
    <Frame flow="angel">
      <IntakeForm
        id={row.id}
        flow="angel"
        initialIntake={row.intake}
        initialSources={row.field_sources}
        extractionMode={row.extraction_mode}
        extractionNote={row.extraction_note}
      />
    </Frame>
  );
}
