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
        <Unavailable message="Sharing is not configured. Add the server secret key." />
      ) : (
        <Unavailable
          message="This report is not available."
          detail="The link may be wrong, or the assessment is not finished yet."
        />
      )}
    </Frame>
  );
}

function Unavailable({ message, detail }: { message: string; detail?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] uppercase tracking-[0.16em] text-muted">Shared report</p>
      <h1 className="font-serif text-4xl leading-tight">{message}</h1>
      {detail ? <p className="text-muted">{detail}</p> : null}
    </div>
  );
}
