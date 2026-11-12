import { NextResponse } from "next/server";
import { getOrCreateVisitor } from "@/lib/auth";
import { ingestDeck, readUploadedDeck } from "@/lib/ingest/deck";
import { fetchDeckFromUrl } from "@/lib/ingest/url";

export const runtime = "nodejs";

/**
 * Public deck intake for angels. Accepts an uploaded file ("deck") or a link
 * ("url"). No account needed: a guest session is created on first use.
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Choose a deck or paste a link." }, { status: 400 });

  const file = form.get("deck");
  const link = String(form.get("url") ?? "").trim();

  let deck: Awaited<ReturnType<typeof readUploadedDeck>>;
  if (file instanceof File && file.size > 0) {
    deck = await readUploadedDeck(file);
  } else if (link) {
    deck = await fetchDeckFromUrl(link);
  } else {
    return NextResponse.json({ error: "Choose a deck or paste a link." }, { status: 400 });
  }
  if ("error" in deck) return NextResponse.json({ error: deck.error }, { status: 400 });

  const visitor = await getOrCreateVisitor();
  if (visitor.error !== undefined) return NextResponse.json({ error: visitor.error }, { status: 503 });

  const result = await ingestDeck(visitor.supabase, visitor.user.id, deck);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ id: result.id });
}
