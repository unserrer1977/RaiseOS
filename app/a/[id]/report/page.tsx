import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Frame } from "@/components/frame";
import { ReportView } from "@/components/report-view";
import { loadOwnedAssessment } from "@/lib/assessments";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, row } = await loadOwnedAssessment(id);
  if (!user) redirect("/login");
  if (!row) notFound();
  if (row.status !== "complete" || !row.report) {
    redirect(row.status === "followup" ? `/a/${id}/follow-up` : `/a/${id}`);
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const shareUrl = `${proto}://${host}/s/${row.share_token}`;

  return (
    <Frame email={user.email}>
      <ReportView report={row.report} shareUrl={shareUrl} />
    </Frame>
  );
}
