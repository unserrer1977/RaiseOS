import type { NextConfig } from "next";
import { resolveSupabaseKeys } from "./lib/supabase/root-secret";

// On Railway the self-hosted Supabase keys are derived from SUPABASE_ROOT_SECRET.
// The publishable key is inlined at build time like any NEXT_PUBLIC_ value.
const { publishableKey } = resolveSupabaseKeys();

const nextConfig: NextConfig = {
  env: publishableKey ? { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey } : {},
  experimental: {
    proxyClientMaxBodySize: "50mb",
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
