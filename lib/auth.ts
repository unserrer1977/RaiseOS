import { createClient } from "@/lib/supabase/server";

export interface SessionUser {
  id: string;
  email: string;
}

export async function getSessionUser(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>> | null;
  user: SessionUser | null;
}> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return { supabase: null, user: null };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) {
    return { supabase, user: null };
  }
  const email = typeof data.claims.email === "string" ? data.claims.email : "";
  return { supabase, user: { id: data.claims.sub, email } };
}

export async function ensureProfile(user: SessionUser) {
  if (!user.email) return;
  const { supabase } = await getSessionUser();
  if (!supabase) return;
  await supabase.from("profiles").upsert(
    { id: user.id, email: user.email },
    { onConflict: "id" },
  );
}
