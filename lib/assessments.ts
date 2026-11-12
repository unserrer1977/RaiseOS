import { getSessionUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import {
  coerceIntake,
  type AssessmentRecord,
  type FollowUp,
  type Report,
} from "@/lib/types";

export function rowToAssessment(row: Record<string, unknown>): AssessmentRecord {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    status: row.status as AssessmentRecord["status"],
    intake: coerceIntake(row.intake),
    field_sources:
      row.field_sources && typeof row.field_sources === "object"
        ? (row.field_sources as AssessmentRecord["field_sources"])
        : {},
    follow_ups: Array.isArray(row.follow_ups) ? (row.follow_ups as FollowUp[]) : [],
    report: row.report ? (row.report as Report) : null,
    share_token: String(row.share_token),
    deck_path: typeof row.deck_path === "string" ? row.deck_path : null,
    deck_name: typeof row.deck_name === "string" ? row.deck_name : null,
    deck_text: typeof row.deck_text === "string" ? row.deck_text : null,
    extraction_mode: row.extraction_mode === "model" ? "model" : "rules",
    extraction_note: typeof row.extraction_note === "string" ? row.extraction_note : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function loadOwnedAssessment(id: string) {
  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) return { user: null, row: null };
  const { data } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  return { user, row: data ? rowToAssessment(data) : null };
}

export async function loadSharedReport(token: string): Promise<
  | { kind: "unconfigured" }
  | { kind: "missing" }
  | { kind: "ok"; report: Report }
> {
  const admin = createAdminClient();
  if (!admin) return { kind: "unconfigured" };
  const { data, error } = await admin
    .from("assessments")
    .select("report, status")
    .eq("share_token", token)
    .eq("status", "complete")
    .maybeSingle();
  if (error || !data?.report) return { kind: "missing" };
  return { kind: "ok", report: data.report as Report };
}
