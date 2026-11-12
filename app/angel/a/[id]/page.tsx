import { notFound, redirect } from "next/navigation";
import { AngelProcessing } from "@/components/angel-processing";
import { Frame } from "@/components/frame";
import { loadOwnedAssessment } from "@/lib/assessments";

export default async function AngelAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, row } = await loadOwnedAssessment(id);
  if (!user) redirect("/angel");
  if (!row) notFound();
  if (row.status === "followup") redirect(`/angel/a/${id}/follow-up`);
  if (row.status === "complete") redirect(`/angel/a/${id}/report`);

  return (
    <Frame flow="angel">
      <AngelProcessing
        id={row.id}
        initialIntake={row.intake}
        extractionNote={row.extraction_note}
      />
    </Frame>
  );
}
