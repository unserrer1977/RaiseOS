import { NextResponse } from "next/server";
import { enrichIntake } from "@/lib/ai/enrich";
import { getSessionUser } from "@/lib/auth";
import { rowToAssessment } from "@/lib/assessments";
import { coerceIntake, type FieldSource } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Assessment not found." }, { status: 404 });

  const row = rowToAssessment(data);
  const body = (await request.json().catch(() => null)) as { intake?: unknown } | null;
  const current = coerceIntake(body?.intake ?? row.intake);
  const enriched = await enrichIntake(row.deck_text ?? "", current);
  if (!enriched || enriched.filled.length === 0) {
    return NextResponse.json({ mode: row.extraction_mode, intake: current, filled: [] });
  }

  const sources: Record<string, FieldSource> = { ...row.field_sources };
  for (const path of enriched.filled) sources[path] = "deck";

  await supabase
    .from("assessments")
    .update({
      intake: enriched.intake,
      field_sources: sources,
      extraction_mode: "model",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "intake");

  return NextResponse.json({
    mode: "model",
    intake: enriched.intake,
    filled: enriched.filled,
  });
}
