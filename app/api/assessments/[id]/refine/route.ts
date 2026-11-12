import { NextResponse } from "next/server";
import { enrichIntake, modelConfigured } from "@/lib/ai/enrich";
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
  // The model reads each deck once; later visits keep what is saved.
  if (row.extraction_mode === "model" || row.status !== "intake") {
    return NextResponse.json({ mode: row.extraction_mode, intake: current, filled: [] });
  }

  // Send the PDF itself when we can, so image-only slides are read too.
  let pdf: Uint8Array | null = null;
  if (modelConfigured() && row.deck_path?.toLowerCase().endsWith(".pdf")) {
    const { data: file, error: downloadError } = await supabase.storage
      .from("decks")
      .download(row.deck_path);
    if (downloadError || !file) {
      console.error("refine: deck download failed", downloadError);
    } else {
      pdf = new Uint8Array(await file.arrayBuffer());
    }
  }

  const locked = new Set(
    Object.entries(row.field_sources)
      .filter(([, source]) => source === "founder")
      .map(([path]) => path),
  );
  const enriched = await enrichIntake(row.deck_text ?? "", current, { pdf, locked });
  if (!enriched) {
    return NextResponse.json({ mode: row.extraction_mode, intake: current, filled: [] });
  }

  // The model can take a while. Re-read the row so anything typed and saved
  // in the meantime is kept.
  const { data: freshData } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  const fresh = freshData ? rowToAssessment(freshData) : row;
  const intake = structuredClone(fresh.intake);
  const sources: Record<string, FieldSource> = { ...fresh.field_sources };
  const filled: string[] = [];
  for (const path of enriched.filled) {
    if (sources[path] === "founder") continue;
    const [pillar, key] = path.split(".") as [keyof typeof intake, string];
    const value = (enriched.intake[pillar] as unknown as Record<string, string>)[key];
    (intake[pillar] as unknown as Record<string, string>)[key] = value;
    sources[path] = "deck";
    filled.push(path);
  }

  await supabase
    .from("assessments")
    .update({
      intake,
      field_sources: sources,
      extraction_mode: "model",
      ...(filled.length > 0 ? { extraction_note: null } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "intake");

  return NextResponse.json({
    mode: "model",
    intake,
    filled,
  });
}
