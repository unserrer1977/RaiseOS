import { notFound, redirect } from "next/navigation";
import { Frame } from "@/components/frame";
import { FollowUpForm } from "@/components/follow-up-form";
import { loadOwnedAssessment } from "@/lib/assessments";

export default async function AngelFollowUpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, row } = await loadOwnedAssessment(id);
  if (!user) redirect("/angel");
  if (!row) notFound();
  if (row.status === "intake") redirect(`/angel/a/${id}`);
  if (row.status === "complete") redirect(`/angel/a/${id}/report`);

  return (
    <Frame flow="angel">
      <FollowUpForm id={row.id} questions={row.follow_ups} flow="angel" />
    </Frame>
  );
}
