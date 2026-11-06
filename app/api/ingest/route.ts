import { randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { extractPdfText } from "@/lib/extract/pdf";
import { extractPptxText } from "@/lib/extract/pptx";
import { prefillFromText } from "@/lib/extract/prefill";

export const runtime = "nodejs";

const MAX_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("deck");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a pitch deck to upload." }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  if (name.endsWith(".key")) {
    return NextResponse.json(
      { error: "Keynote files need to be exported as PDF first." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Decks must be 50MB or smaller." }, { status: 400 });
  }

  const kind = deckKind(file);
  if (!kind) {
    return NextResponse.json(
      { error: "Upload a PDF or PPTX deck." },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (kind === "pdf" && !isPdf(bytes)) {
    return NextResponse.json({ error: "That file is not a PDF." }, { status: 400 });
  }
  if (kind === "pptx" && !isZip(bytes)) {
    return NextResponse.json({ error: "That file is not a PPTX." }, { status: 400 });
  }

  let text = "";
  try {
    text = kind === "pdf" ? await extractPdfText(bytes) : await extractPptxText(bytes);
  } catch {
    return NextResponse.json(
      { error: "That file could not be read. Export a fresh PDF and try again." },
      { status: 400 },
    );
  }

  const prefill = prefillFromText(text);
  const id = randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const deckPath = `${user.id}/${id}/${safeName}`;
  const { error: uploadError } = await supabase.storage.from("decks").upload(deckPath, bytes, {
    contentType: file.type || (kind === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
    upsert: false,
  });
  if (uploadError) {
    return NextResponse.json({ error: "The deck could not be stored." }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("assessments").insert({
    id,
    user_id: user.id,
    status: "intake",
    intake: prefill.intake,
    field_sources: prefill.sources,
    follow_ups: [],
    share_token: randomBytes(24).toString("base64url"),
    deck_path: deckPath,
    deck_name: file.name,
    deck_text: text.slice(0, 80000),
    extraction_mode: "rules",
    extraction_note: prefill.thin
      ? "Little text came out of this deck. Image-only slides have to be filled in by hand."
      : null,
  });

  if (insertError) {
    await supabase.storage.from("decks").remove([deckPath]);
    return NextResponse.json({ error: "The assessment could not be created." }, { status: 500 });
  }

  return NextResponse.json({ id });
}

function isPdf(bytes: Uint8Array): boolean {
  return bytes.length > 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

function isZip(bytes: Uint8Array): boolean {
  return bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

function deckKind(file: File): "pdf" | "pptx" | null {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") return "pdf";
  if (
    name.endsWith(".pptx") ||
    file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return "pptx";
  }
  return null;
}
