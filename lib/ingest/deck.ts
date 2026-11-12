import { randomBytes, randomUUID } from "node:crypto";
import type { createClient } from "@/lib/supabase/server";
import { MAX_DECK_TEXT_CHARS, readPdfDeck, readPptxDeck } from "@/lib/extract/deck-read";
import { prefillFromText } from "@/lib/extract/prefill";

export const MAX_DECK_BYTES = 50 * 1024 * 1024;

const PPTX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type IngestResult = { id: string } | { error: string; status: number };

/** Turns deck bytes into a stored deck plus a new assessment in "intake". */
export async function ingestDeck(
  supabase: Supabase,
  userId: string,
  deck: { bytes: Uint8Array; fileName: string; kind: "pdf" | "pptx" },
): Promise<IngestResult> {
  const { bytes, fileName, kind } = deck;
  if (bytes.length > MAX_DECK_BYTES) return { error: "Decks must be 50MB or smaller.", status: 400 };
  if (kind === "pdf" && !isPdf(bytes)) return { error: "That file is not a PDF.", status: 400 };
  if (kind === "pptx" && !isZip(bytes)) return { error: "That file is not a PPTX.", status: 400 };

  let text = "";
  try {
    const read = kind === "pdf" ? await readPdfDeck(bytes) : await readPptxDeck(bytes);
    text = read.text;
  } catch {
    return { error: "That file could not be read. Export a fresh PDF and try again.", status: 400 };
  }

  const prefill = prefillFromText(text);
  const id = randomUUID();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || `deck.${kind}`;
  const deckPath = `${userId}/${id}/${safeName}`;
  const { error: uploadError } = await supabase.storage.from("decks").upload(deckPath, bytes, {
    contentType: kind === "pdf" ? "application/pdf" : PPTX_MIME,
    upsert: false,
  });
  if (uploadError) {
    console.error("ingestDeck: deck upload failed", uploadError);
    return { error: "The deck could not be stored.", status: 500 };
  }

  const { error: insertError } = await supabase.from("assessments").insert({
    id,
    user_id: userId,
    status: "intake",
    intake: prefill.intake,
    field_sources: prefill.sources,
    follow_ups: [],
    share_token: randomBytes(24).toString("base64url"),
    deck_path: deckPath,
    deck_name: fileName,
    deck_text: text.slice(0, MAX_DECK_TEXT_CHARS),
    extraction_mode: "rules",
    extraction_note: prefill.thin
      ? "Little text came out of this deck. Image-only slides have to be filled in by hand."
      : null,
  });

  if (insertError) {
    console.error("ingestDeck: assessment insert failed", insertError);
    await supabase.storage.from("decks").remove([deckPath]);
    return { error: "The assessment could not be created.", status: 500 };
  }
  return { id };
}

/** Reads an uploaded File and works out whether it is a PDF or PPTX. */
export async function readUploadedDeck(
  file: File,
): Promise<{ bytes: Uint8Array; fileName: string; kind: "pdf" | "pptx" } | { error: string }> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".key")) return { error: "Keynote files need to be exported as PDF first." };
  if (file.size > MAX_DECK_BYTES) return { error: "Decks must be 50MB or smaller." };
  const kind = kindFromName(file.name, file.type);
  if (!kind) return { error: "Upload a PDF or PPTX deck." };
  return { bytes: new Uint8Array(await file.arrayBuffer()), fileName: file.name, kind };
}

export function kindFromName(fileName: string, mime = ""): "pdf" | "pptx" | null {
  const name = fileName.toLowerCase();
  if (name.endsWith(".pdf") || mime === "application/pdf") return "pdf";
  if (name.endsWith(".pptx") || mime === PPTX_MIME) return "pptx";
  return null;
}

/** Works out the deck type from the first bytes, for files fetched from a link. */
export function kindFromBytes(bytes: Uint8Array): "pdf" | "pptx" | null {
  if (isPdf(bytes)) return "pdf";
  if (isZip(bytes)) return "pptx";
  return null;
}

export function isPdf(bytes: Uint8Array): boolean {
  return bytes.length > 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

export function isZip(bytes: Uint8Array): boolean {
  return bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}
