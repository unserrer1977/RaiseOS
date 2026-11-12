# Raise Insight by Angel OS

Raise Insight turns a pitch deck into a five-pillar intake, at most four venture follow-ups, and a fundability report. Founders sign in with email and password or Google. Assessments and decks live in your Supabase project.

## Setup

1. Create a Supabase project and enable the Email provider. For Google, add a Web OAuth client and paste the client id and secret into the Google provider in the Supabase dashboard. Allow `{site}/auth/callback` as a redirect URL.
2. Apply the SQL migration in `supabase/migrations`.
3. Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (server only, used to resolve a share link to the finished report)
- `OPENROUTER_API_KEY` (optional; without it, deck prefill and the report stay on the deterministic rules). When set, PDF uploads also run per-slide text extraction and OCR on image-only pages (adapted from angelosmt’s deck reader); intake refinement then uses slide-labelled text instead of re-attaching the PDF.
- `OPENROUTER_MODEL` (optional; OpenRouter model id. It must accept PDF file parts. Defaults to `google/gemini-3.5-flash-lite`)

4. `npm run dev`. Set the public Supabase variables before `npm run build` as well; Next.js inlines `NEXT_PUBLIC_` values at build time.

Decks are stored in a private `decks` bucket. Share links return the finished report only.

## Deploying on Railway (self-hosted Supabase)

The `raiseos` Railway project runs Supabase itself (Postgres, Auth, Storage, the Envoy gateway, Studio) next to the `RaiseOS` app service. That template derives every API key from a single `ROOT_SECRET`, so the app service is wired with reference variables instead of copied keys:

| Variable on `RaiseOS` | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://${{Envoy.RAILWAY_PUBLIC_DOMAIN}}` |
| `SUPABASE_ROOT_SECRET` | `${{Envoy.ROOT_SECRET}}` (the publishable and secret keys are derived from it) |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (private network, used by the migration step) |

The service's pre-deploy command is `npm run db:migrate`, which applies any new file in `supabase/migrations` before the new version goes live and records it in `supabase_migrations.schema_migrations`.

Auth settings live on the `Gotrue Auth` service: `GOTRUE_SITE_URL` and `GOTRUE_URI_ALLOW_LIST` point at the app's domain, anonymous sign-ins are on for `/angel`, and `GOTRUE_MAILER_AUTOCONFIRM=true` because no SMTP server is configured (add `GOTRUE_SMTP_*` variables and set it to `false` to require email confirmation). Google sign-in needs `GOTRUE_EXTERNAL_GOOGLE_ENABLED`, `GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID`, `GOTRUE_EXTERNAL_GOOGLE_SECRET` and `GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI` (`https://<envoy domain>/auth/v1/callback`).

## Angel flow (`/angel`)

`/angel` is a public version of the same assessment, written for angel investors deciding whether an opportunity is right for them. Anyone can upload a deck or paste a deck link without registering or entering a password.

- Behind the scenes each visitor gets an invisible guest session (Supabase anonymous sign-in), so the existing row-level security keeps each visitor's decks private to their browser. **Turn on anonymous sign-ins** in the Supabase dashboard: Authentication → Sign In / Providers → "Allow anonymous sign-ins". Until then, uploads on `/angel` show an error saying so.
- Deck links are downloaded on the server. Direct PDF/PPTX links work, and Google Drive, Google Slides and Dropbox share links are converted to direct downloads. Links behind a password, sign-in or email gate (for example DocSend) can't be read; the page asks visitors to check this. Private and internal network addresses are refused.
- Guest sessions are kept out of founder pages (`/home`, `/a/...`).

## Checks

- `npm test`
- `npm run typecheck`

## Product design

- **[UI specification (designer handoff)](docs/UI_SPEC.md)** — scope, IA, screen inventory, design-system guidance, and accessibility targets for Raise Insight.
