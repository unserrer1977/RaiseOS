import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Frame } from "@/components/frame";
import { Uploader } from "@/components/uploader";
import { ensureProfile, getSessionUser } from "@/lib/auth";
import { rowToAssessment } from "@/lib/assessments";
import type { Report } from "@/lib/types";

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
      <h1 className="font-serif text-4xl">Your assessments</h1>
      <p className="mt-3 text-muted">Start a new one, or open a report you already finished.</p>
      <div className="mt-8">
        <Uploader />
      </div>
      {rows.length > 0 ? (
        <ul className="mt-10 divide-y divide-line border-t border-line">
          {rows.map((row) => {
            const href =
              row.status === "complete"
                ? `/a/${row.id}/report`
                : row.status === "followup"
                  ? `/a/${row.id}/follow-up`
                  : `/a/${row.id}`;
            const title = row.intake.company.legalName || row.deck_name || "Untitled assessment";
            const verdict = (row.report as Report | null)?.verdictLabel;
            return (
              <li key={row.id}>
                <Link href={href} className="flex items-baseline justify-between gap-4 py-4">
                  <span className="font-serif text-2xl">{title}</span>
                  <span className="text-sm text-muted">{verdict ?? row.status}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </Frame>
  );
}
