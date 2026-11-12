import { createHash, hkdfSync } from "node:crypto";

// The self-hosted Supabase template on Railway (github.com/6ixfalls/supabase)
// derives every API key from one ROOT_SECRET at startup, so no Railway
// variable holds a finished key. This reproduces the template's derivation
// (secrets/internal/secrets/secrets.go, "supabase-secrets/v1") for the two
// keys the app needs, so the app can reference the gateway's ROOT_SECRET.

const DERIVATION_VERSION = "supabase-secrets/v1";
const PROJECT_REF = "supabase-self-hosted";

function base64Url(value: Buffer) {
  return value.toString("base64url");
}

function opaqueKey(rootSecret: string, label: string, prefix: string) {
  const bytes = Buffer.from(hkdfSync("sha256", rootSecret, DERIVATION_VERSION, `opaque-${label}`, 17));
  const intermediate = prefix + base64Url(bytes).slice(0, 22);
  const checksum = createHash("sha256").update(`${PROJECT_REF}|${intermediate}`).digest();
  return `${intermediate}_${base64Url(checksum).slice(0, 8)}`;
}

export function deriveSupabaseKeys(rootSecret: string) {
  if (Buffer.byteLength(rootSecret) < 32) {
    throw new Error("SUPABASE_ROOT_SECRET must contain at least 32 bytes");
  }
  return {
    publishableKey: opaqueKey(rootSecret, "publishable", "sb_publishable_"),
    secretKey: opaqueKey(rootSecret, "secret", "sb_secret_"),
  };
}

/** Explicit keys win; otherwise derive from SUPABASE_ROOT_SECRET when it is set. */
export function resolveSupabaseKeys(env: NodeJS.ProcessEnv = process.env) {
  const root = env.SUPABASE_ROOT_SECRET;
  const derived = root ? deriveSupabaseKeys(root) : undefined;
  return {
    publishableKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || derived?.publishableKey,
    secretKey: env.SUPABASE_SECRET_KEY || derived?.secretKey,
  };
}
