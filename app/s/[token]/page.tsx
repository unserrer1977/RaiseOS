import { Frame } from "@/components/frame";
import { ReportView } from "@/components/report-view";
import { loadSharedReport } from "@/lib/assessments";

export default async function SharedReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await loadSharedReport(token);

  return (
    <Frame>
      {result.kind === "ok" ? (
        <ReportView report={result.report} />
      ) : result.kind === "unconfigured" ? (
        <p>Sharing is not configured. Add the server secret key.</p>
      ) : (
        <p>This report is not available.</p>
      )}
    </Frame>
  );
}
