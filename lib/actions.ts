"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { enrichReportProse } from "@/lib/ai/enrich";
import { getSessionUser } from "@/lib/auth";
import { rowToAssessment } from "@/lib/assessments";
import {
  coerceIntake,
  type FieldSource,
  type FollowUp,
  type Intake,
} from "@/lib/types";
import { buildReport } from "@/lib/venture/report";
import { selectFollowUps } from "@/lib/venture/rules";

async function origin() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function signIn(formData: FormData) {
  const { supabase } = await getSessionUser();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/home");
}

export async function signUp(formData: FormData) {
  const { supabase } = await getSessionUser();
  if (!supabase) redirect("/register?error=Supabase%20is%20not%20configured");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${await origin()}/auth/callback` },
  });
  if (error) redirect(`/register?error=${encodeURIComponent(error.message)}`);
  if (!data.session) redirect("/register?check=1");
  redirect("/home");
}

export async function signInWithGoogle() {
  const { supabase } = await getSessionUser();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await origin()}/auth/callback` },
  });
  if (error || !data.url) {
    redirect("/login?error=Google%20sign-in%20is%20not%20available%20on%20this%20project");
  }
  redirect(data.url);
}

export async function saveIntake(
  id: string,
  intake: Intake,
  sources: Record<string, FieldSource>,
) {
  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) return { error: "Sign in required." };
  const { error } = await supabase
    .from("assessments")
    .update({
      intake: coerceIntake(intake),
      field_sources: sources,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: "Could not save this assessment." };
  return { ok: true as const };
}

export type Flow = "founder" | "angel";

/** Where the assessment pages live for each flow. */
function basePath(flow: Flow, id: string) {
  return flow === "angel" ? `/angel/a/${id}` : `/a/${id}`;
}

export async function submitIntake(
  id: string,
  intake: Intake,
  sources: Record<string, FieldSource>,
  flow: Flow = "founder",
) {
  const saved = await saveIntake(id, intake, sources);
  if ("error" in saved && saved.error) return saved;
  return routeAfterIntakeReady(id, coerceIntake(intake), flow);
}

/** After deck refine: venture verdict + founder questions from the deck only. */
export async function advanceAngelAssessment(id: string) {
  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) return { error: "Sign in required." };
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) return { error: "Assessment not found." };
  const row = rowToAssessment(data);
  if (row.status === "complete") {
    redirect(`/angel/a/${id}/report`);
  }

  const intake = row.intake;
  const followUps = selectFollowUps(intake);
  const report = await finalize(id, intake, followUps, row.deck_text ?? "");
  const { error: updateError } = await supabase
    .from("assessments")
    .update({
      status: "complete",
      follow_ups: followUps,
      report,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (updateError) return { error: "Could not finish the assessment." };
  redirect(`/angel/a/${id}/report`);
}

async function routeAfterIntakeReady(id: string, intake: Intake, flow: Flow) {
  const followUps = selectFollowUps(intake);
  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) return { error: "Sign in required." };

  if (followUps.length === 0) {
    const report = await finalize(id, intake, followUps);
    const { error } = await supabase
      .from("assessments")
      .update({
        status: "complete",
        follow_ups: [],
        report,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return { error: "Could not finish the assessment." };
    redirect(`${basePath(flow, id)}/report`);
  }

  const { error } = await supabase
    .from("assessments")
    .update({
      status: "followup",
      follow_ups: followUps,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: "Could not save follow-up questions." };
  redirect(`${basePath(flow, id)}/follow-up`);
}

export async function submitFollowUps(
  id: string,
  answers: { id: FollowUp["id"]; answer: string }[],
  flow: Flow = "founder",
) {
  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) return { error: "Sign in required." };
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) return { error: "Assessment not found." };
  const row = rowToAssessment(data);
  const followUps = row.follow_ups.map((item) => ({
    ...item,
    answer: answers.find((answer) => answer.id === item.id)?.answer ?? item.answer,
  }));
  const report = await finalize(id, row.intake, followUps, row.deck_text ?? "");
  const { error: updateError } = await supabase
    .from("assessments")
    .update({
      status: "complete",
      follow_ups: followUps,
      report,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (updateError) return { error: "Could not save the report." };
  redirect(`${basePath(flow, id)}/report`);
}

async function finalize(id: string, intake: Intake, followUps: FollowUp[], deckText = "") {
  let text = deckText;
  if (!text) {
    const { supabase, user } = await getSessionUser();
    if (supabase && user) {
      const { data } = await supabase
        .from("assessments")
        .select("deck_text")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      text = typeof data?.deck_text === "string" ? data.deck_text : "";
    }
  }
  const report = buildReport(intake, followUps);
  return enrichReportProse(report, text);
}
