import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Frame } from "@/components/frame";
import { ReportView } from "@/components/report-view";
import { loadOwnedAssessment } from "@/lib/assessments";
import { buildFounderQuestions } from "@/lib/venture/angel-questions";

export default async function AngelReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, row } = await loadOwnedAssessment(id);
  if (!user) redirect("/angel");
  if (!row) notFound();
  if (row.status !== "complete" || !row.report) {
    redirect(row.status === "followup" ? `/angel/a/${id}/follow-up` : `/angel/a/${id}`);
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const shareUrl = `${proto}://${host}/s/${row.share_token}`;

  return (
    <Frame flow="angel">
      <ReportView
        flow="angel"
        report={row.report}
        founderQuestions={buildFounderQuestions(row.intake, row.follow_ups)}
        shareUrl={shareUrl}
        dateLabel={new Date(row.updated_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      />
    </Frame>
  );
}
