import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Frame } from "@/components/frame";
import { Uploader } from "@/components/uploader";
import { VerdictPill } from "@/components/verdict";
import { ensureProfile, getSessionUser } from "@/lib/auth";
import { rowToAssessment } from "@/lib/assessments";
import type { AssessmentStatus, Report } from "@/lib/types";

const STATUS_LABEL: Record<AssessmentStatus, string> = {
  intake: "In progress: intake",
  followup: "Waiting on follow-ups",
  complete: "Complete",
};

const NEXT_STEPS = [
  { title: "1. Check the intake", body: "Five short steps, mostly filled from your deck." },
  { title: "2. Answer follow-ups", body: "Up to four, only where the numbers break." },
  { title: "3. Read the report", body: "A verdict you can share or save as a PDF." },
];

function formatUpdated(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "updated today";
  return `updated ${date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}

export default async function AssessmentsPage() {
  await connection();
  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) redirect("/login");
  await ensureProfile(user);

  const { data } = await supabase
    .from("assessments")
    .select("id, status, intake, report, deck_name, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const rows = (data ?? []).map((row) => rowToAssessment(row));

  return (
    <Frame email={user.email}>
      <div className="flex flex-col gap-3">
        <h1 className="font-serif text-4xl leading-tight sm:text-[40px]">Your assessments</h1>
        <p className="text-muted">Start a new one, or open a report you already finished.</p>
      </div>
      <div className="mt-8">
        <Uploader />
      </div>
      {rows.length > 0 ? (
        <ul className="mt-12 border-t border-line">
          {rows.map((row) => {
            const href =
              row.status === "complete"
                ? `/a/${row.id}/report`
                : row.status === "followup"
                  ? `/a/${row.id}/follow-up`
                  : `/a/${row.id}`;
            const companyName = row.intake.company.legalName.trim();
            const title = companyName || row.deck_name || "Untitled assessment";
            const meta = [companyName && row.deck_name ? row.deck_name : "", formatUpdated(row.updated_at)]
              .filter(Boolean)
              .join(" · ");
            const report = row.report as Report | null;
            return (
              <li key={row.id} className="border-b border-line">
                <Link
                  href={href}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-5 text-ink"
                >
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-serif text-2xl leading-tight">{title}</span>
                    {meta ? <span className="text-[13px] text-muted">{meta}</span> : null}
                  </span>
                  {report && row.status === "complete" ? (
                    <VerdictPill verdict={report.verdict} label={report.verdictLabel} />
                  ) : (
                    <span className="whitespace-nowrap rounded-full border border-muted px-3 py-1 text-[13px] text-muted">
                      {STATUS_LABEL[row.status] ?? row.status}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-8 grid gap-4 border-t border-line pt-6 text-sm text-muted sm:grid-cols-3">
          {NEXT_STEPS.map((step) => (
            <p key={step.title}>
              <strong className="block font-medium text-ink">{step.title}</strong>
              {step.body}
            </p>
          ))}
        </div>
      )}
    </Frame>
  );
}
