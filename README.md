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

## Angel flow (`/angel`)

`/angel` is a public version of the same assessment, written for angel investors deciding whether an opportunity is right for them. Anyone can upload a deck or paste a deck link without registering or entering a password.

- Behind the scenes each visitor gets an invisible guest session (Supabase anonymous sign-in), so the existing row-level security keeps each visitor's decks private to their browser. **Turn on anonymous sign-ins** in the Supabase dashboard: Authentication → Sign In / Providers → "Allow anonymous sign-ins". Until then, uploads on `/angel` show an error saying so.
- Deck links are downloaded on the server. Direct PDF/PPTX links work, and Google Drive, Google Slides and Dropbox share links are converted to direct downloads. Links behind a password, sign-in or email gate (for example DocSend) can't be read; the page asks visitors to check this. Private and internal network addresses are refused.
- Guest sessions are kept out of founder pages (`/home`, `/a/...`).

## Checks

- `npm test`
- `npm run typecheck`

## Product design

- **[UI specification (designer handoff)](docs/UI_SPEC.md)** — scope, IA, screen inventory, design-system guidance, and accessibility targets for RaiseOS.
