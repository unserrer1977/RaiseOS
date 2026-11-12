import { createClient } from "@/lib/supabase/server";

export interface SessionUser {
  id: string;
  email: string;
  /** True for the invisible guest sessions the angel flow creates. */
  isAnonymous: boolean;
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
  const isAnonymous = data.claims.is_anonymous === true;
  return { supabase, user: { id: data.claims.sub, email, isAnonymous } };
}

/**
 * Returns the current user, or quietly starts a guest (anonymous) session so
 * an angel can run an assessment without registering or entering a password.
 * Only call this from a Route Handler or Server Action, where cookies can be set.
 */
export async function getOrCreateVisitor(): Promise<
  | { supabase: Awaited<ReturnType<typeof createClient>>; user: SessionUser; error?: undefined }
  | { supabase?: undefined; user?: undefined; error: string }
> {
  const { supabase, user } = await getSessionUser();
  if (!supabase) return { error: "Supabase is not configured." };
  if (user) return { supabase, user };
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    return {
      error:
        "Guest access is not switched on yet. Enable anonymous sign-ins in the Supabase dashboard (Authentication → Sign In / Providers).",
    };
  }
  return { supabase, user: { id: data.user.id, email: "", isAnonymous: true } };
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
