# RaiseOS

RaiseOS turns a pitch deck into a five-pillar intake, at most four venture follow-ups, and a fundability report. Founders sign in with email and password or Google. Assessments and decks live in your Supabase project.

## Setup

1. Create a Supabase project and enable the Email provider. For Google, add a Web OAuth client and paste the client id and secret into the Google provider in the Supabase dashboard. Allow `{site}/auth/callback` as a redirect URL.
2. Apply the SQL migration in `supabase/migrations`.
3. Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (server only, used to resolve a share link to the finished report)
- `AI_GATEWAY_API_KEY` (optional; without it, deck prefill and the report stay on the deterministic rules)

4. `npm run dev`. Set the public Supabase variables before `npm run build` as well; Next.js inlines `NEXT_PUBLIC_` values at build time.

Decks are stored in a private `decks` bucket. Share links return the finished report only.

## Checks

- `npm test`
- `npm run typecheck`

## Product design

- **[UI specification (designer handoff)](docs/UI_SPEC.md)** — scope, IA, screen inventory, design-system guidance, and accessibility targets for RaiseOS.
