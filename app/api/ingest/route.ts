import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ingestDeck, readUploadedDeck } from "@/lib/ingest/deck";

export const runtime = "nodejs";

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

  const deck = await readUploadedDeck(file);
  if ("error" in deck) return NextResponse.json({ error: deck.error }, { status: 400 });

  const result = await ingestDeck(supabase, user.id, deck);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ id: result.id });
}
