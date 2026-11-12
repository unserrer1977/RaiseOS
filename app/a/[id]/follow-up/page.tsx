import { notFound, redirect } from "next/navigation";
import { Frame } from "@/components/frame";
import { FollowUpForm } from "@/components/follow-up-form";
import { loadOwnedAssessment } from "@/lib/assessments";

export default async function FollowUpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, row } = await loadOwnedAssessment(id);
  if (!user) redirect("/login");
  if (!row) notFound();
  if (row.status === "intake") redirect(`/a/${id}`);
  if (row.status === "complete") redirect(`/a/${id}/report`);

  return (
    <Frame email={user.email}>
      <FollowUpForm id={row.id} questions={row.follow_ups} />
    </Frame>
  );
}
