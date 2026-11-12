import { notFound, redirect } from "next/navigation";
import { Frame } from "@/components/frame";
import { IntakeForm } from "@/components/intake-form";
import { ensureProfile } from "@/lib/auth";
import { loadOwnedAssessment } from "@/lib/assessments";

export default async function IntakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, row } = await loadOwnedAssessment(id);
  if (!user) redirect("/login");
  if (!row) notFound();
  if (row.status === "followup") redirect(`/a/${id}/follow-up`);
  if (row.status === "complete") redirect(`/a/${id}/report`);
  await ensureProfile(user);

  return (
    <Frame email={user.email}>
      <IntakeForm
        id={row.id}
        initialIntake={row.intake}
        initialSources={row.field_sources}
        extractionMode={row.extraction_mode}
        extractionNote={row.extraction_note}
      />
    </Frame>
  );
}
