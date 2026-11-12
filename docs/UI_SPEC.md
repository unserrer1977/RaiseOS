# RaiseOS — UI specification (designer handoff)

**Version:** 2.0
**Last updated:** 2026-11-12
**Audience:** Product design, visual design, content design, design tools (Figma, v0, Lovable, Stitch and similar)

This document describes every screen, feature, field and state in RaiseOS as it is built today, plus the benefits each feature delivers. It is written so it can be pasted into a design tool as the brief. Anything marked **(proposed)** is not built yet and is a suggestion for design to explore.

---

## 0. Brief for a design tool (copy this block)

> Design a calm, editorial web app called **RaiseOS** for early-stage startup founders. A founder uploads a pitch deck (PDF or PPTX). RaiseOS reads it, pre-fills a five-step intake (Company, Problem and solution, Go-to-market, Traction, Cap table), asks at most four sharp follow-up questions a venture partner would ask, and produces a **fundability report** with one of three verdicts: *Highly Fundable*, *Borderline/Niche* or *Bootstrapping Recommended*. The report has a rationale, a venture-scale paragraph, green flags, red flags and a SWOT. It can be shared by private link or saved as a PDF.
>
> Screens: landing, register, sign in, assessments home (upload + list), five-step intake wizard, follow-up questions, report, public shared report.
>
> Visual direction: warm paper background (#F3EFE6), near-black ink text (#1A1714), deep green accent (#0E6B52), serif display type (Fraunces) with a clean geometric sans for UI (Outfit). Generous white space, a single narrow content column (max 768px), pill-shaped buttons, underline-style inputs, thin hairline dividers. It should feel like a respected investor's memo, not a SaaS dashboard. Mobile-first and WCAG 2.2 AA.

---

## 1. Product definition

**Name:** RaiseOS
**Tagline (live on landing page):** "A partner's read on whether this is a venture-scale company."
**One-line description:** Upload the deck. RaiseOS fills the intake, asks at most four follow-ups when the story does not hold, and leaves you with a fundability report you can share.

### 1.1 Who it is for

| Persona | Goal | Pain today | What RaiseOS gives them |
|---|---|---|---|
| **Founder (primary)** — pre-seed to Series A | Know if their company is a fit for venture money before pitching | Feedback from investors is slow, vague or absent; rejections rarely explain why | An honest, structured verdict in minutes, with the specific gaps to fix |
| **Report reader (secondary)** — co-founder, advisor, accelerator, angel | Understand a company's fundability quickly | Has to read a whole deck and do the analysis themselves | A one-page report via share link, no account needed |

### 1.2 Core benefits (use in marketing copy and empty states)

1. **Minutes, not meetings.** The deck does most of the typing; the founder only checks and fills gaps.
2. **Investor-grade questions.** Follow-ups only appear when a number breaks the venture story, the same way a partner would push back.
3. **A clear verdict.** One of three plain answers instead of "interesting, keep us posted".
4. **Know what to fix.** Red flags name the exact structural gap (market size, go-to-market, cap table, unit economics, margins, traction).
5. **Honest about bootstrapping.** If venture money is the wrong tool, the report says so, which saves months of fundraising.
6. **Private by default.** Decks live in the founder's private storage and are not used to train a model.
7. **Easy to share.** A private link shows only the finished report; a print-ready PDF is one click away.

### 1.3 Non-goals for MVP

Native mobile apps, investor-side dealflow tools, team workspaces with roles, payments, multi-language.

---

## 2. Features, functions and benefits

| # | Feature | What it does (function) | Benefit to the founder |
|---|---|---|---|
| F1 | **Accounts** | Register and sign in with email + password, or with Google. Email confirmation supported ("check your email" state). Sign out from the header. | Assessments are saved and private to the founder. |
| F2 | **Deck upload** | Drag-and-drop or file picker. Accepts PDF or PPTX up to 50 MB. Keynote must be exported to PDF. Validates the real file type, not just the extension. | One action starts everything; no forms to fill from scratch. |
| F3 | **Automatic prefill** | Extracts text from the deck and fills intake fields using rules. If an AI key is configured, a model then fills any fields still empty, without overwriting anything the founder typed. | Less typing, fewer missed numbers. |
| F4 | **Field provenance** | Each field remembers whether its value came from the deck or the founder. Deck-filled fields show a **"From deck"** tag; the tag disappears once the founder edits. A header label shows **"Rules prefill"** or **"Model-assisted prefill"**. | The founder knows what to double-check; trust in the numbers. |
| F5 | **Thin-deck warning** | If little text came out (image-only slides), a warning explains those fields must be filled by hand. | No silent failures. |
| F6 | **Five-pillar intake wizard** | Five steps with progress bar, Back / Next, and autosave on every step. Can be left and resumed from the home list. | Structured like an investor's diligence checklist; nothing gets lost. |
| F7 | **Venture follow-ups** | After the intake, up to four questions are generated from the numbers (see §6). Each shows the question and *why* it is being asked. If nothing breaks, this step is skipped. | Practice answering the hard questions before a real partner asks them. |
| F8 | **Fundability report** | Verdict, rationale, venture-scale assessment, green flags, red flags, SWOT. Shows whether the narrative was written by rules or phrased by a model. | A clear answer and a to-do list. |
| F9 | **Share link** | Each assessment has a private, unguessable link. The link shows only the finished report, with no account needed. "Copy share link" button confirms with "Link copied". | Send to co-founders, advisors or accelerators in one click. |
| F10 | **Download PDF** | Print-optimised layout (header and buttons hidden, white background). | A tidy document to attach to emails or applications. |
| F11 | **Assessments home** | Lists every assessment, newest first, with company name and verdict or progress status. Clicking resumes exactly where the founder left off. | Track several companies, or re-run after improving the deck. |

### 2.1 Proposed features (not built — design may explore)

- **(proposed)** Re-run an assessment after editing answers, and compare verdicts over time.
- **(proposed)** Delete an assessment and its deck.
- **(proposed)** Revoke or regenerate a share link.
- **(proposed)** "What would change the verdict" panel: which single fix would move the verdict up.
- **(proposed)** Forgot-password flow.

---

## 3. Design principles

1. **Editorial, not dashboard.** Serif headlines, generous white space, one narrow column. It should read like a memo from a partner.
2. **One question per moment.** Each intake step has a single plain-English headline question (e.g. "How does a dollar get in?").
3. **Show your working.** Provenance tags, the reason under every follow-up, and the "rules vs model" label build trust.
4. **Direct, kind copy.** Say the hard thing plainly ("A seed fund is the wrong instrument…") without being harsh.
5. **Accessible by default.** WCAG 2.2 AA; colour is never the only signal.
6. **Mobile first.** Every screen works at 375px wide.

---

## 4. Information architecture

```text
/                     Landing (signed-out). Signed-in users go to /home
/register             Create account
/login                Sign in
/home                 Your assessments: upload + list
/a/:id                Intake wizard (5 steps)
/a/:id/follow-up      Follow-up questions
/a/:id/report         Report (owner view, with share + PDF)
/s/:token             Shared report (public, read-only)
/auth/callback        Google / email-confirmation return (no UI)
/auth/signout         Sign out (no UI)
```

**Navigation model:** top bar only (few sections). No sidebar.

**Assessment lifecycle** (drives routing and the status shown on the home list):

```text
Upload deck ─► intake ─► followup ─► complete
                  │                     ▲
                  └── no follow-ups ────┘
```

Opening an assessment always sends the founder to the step matching its status.

---

## 5. Global layout and shell

- **Container:** centred, max width 768px (`max-w-3xl`), 20px side padding, 32px top/bottom padding. Same for every screen.
- **Header** (hidden when printing):
  - Left: **RaiseOS** wordmark in serif, links to `/`.
  - Right, signed out: "Sign in" (muted), "Register" (ink).
  - Right, signed in: "Assessments" link, user email (hidden on mobile), "Sign out" button.
- **Main:** 48px vertical padding.
- **No footer** in MVP. **(proposed)** a minimal footer with Privacy and Terms links.

### 5.1 Global states

| State | Behaviour |
|---|---|
| Not signed in on a private page | Redirect to `/login` |
| Assessment not found / not yours | 404 page (**design needed**) |
| Server not configured | Error message on sign-in page (e.g. "Supabase is not configured") |
| Loading | Buttons change label while working ("Saving…", "Reading the deck…", "Writing the report…"). **(proposed)** skeletons for the home list. |

---

## 6. The venture logic (so design understands the content)

### 6.1 Follow-up triggers (max 4, in this order)

| ID | Shown when | Question shown to founder | "Why we ask" line |
|---|---|---|---|
| `market_scale` | TAM under $1B, or no TAM and a narrow customer | "Given the $X TAM, how do you plan to achieve a venture-scale exit ($1B+ valuation), or are you planning to expand into adjacent markets?" | Venture funds need a market that can support a $1B+ outcome. |
| `gtm_plg` | Enterprise customer but low price (≤ $100/month or < $5k ACV) | "Your price ($X) is low for an enterprise sales motion. Are you employing a product-led growth model to keep CAC near zero?" | Enterprise sales teams rarely pay back on a low ACV. |
| `cap_table` | Founders own < 40% at pre-seed or seed | "The founding team equity (X%) is notably low for this stage. Was there an earlier spin-out, or is there a plan to refresh the option pool?" | Founders owning under 40% at seed often cannot take dilution from a new round. |
| `unit_economics` | CAC higher than LTV | "CAC ($X) is higher than LTV ($Y). How do these unit economics reach a venture return, or which input is misstated?" | Paying more to acquire a customer than they are worth breaks the model. |
| `traction_evidence` | No revenue, users, growth or churn given (and CAC/LTV not already flagged) | "The intake does not show revenue, users, or growth. What traction should an investor underwrite today?" | No operating evidence is on the page yet. |

### 6.2 Verdicts

| Verdict | Rule | Tone for design |
|---|---|---|
| **Highly Fundable** | No structural gaps, market ≥ $1B (or answered), traction present | Positive: accent green |
| **Borderline/Niche** | Exactly one gap, or a key input missing | Neutral/caution: warn amber |
| **Bootstrapping Recommended** | Two or more gaps | Serious but respectful: danger red, never alarming |

**Structural gaps** that create red flags: market size, go-to-market, cap table, unit economics, margin structure (hardware/services), traction.

**Green flags** can include: TAM ≥ $1B, MoM growth ≥ 10%, founders own ≥ 50%, LTV ≥ 3× CAC, software business model, stated revenue.

---

## 7. Screen inventory

Each screen lists purpose, content blocks (with real copy), and states to design.

### 7.1 Landing — `/`

- **Purpose:** explain the value and get the founder to register.
- **Blocks (built):**
  - Kicker (small caps, muted): "For early-stage founders"
  - H1 (serif, 48px): "A partner's read on whether this is a venture-scale company."
  - Body (18px, muted): "Upload the deck. RaiseOS fills the intake, asks at most four follow-ups when the story does not hold, and leaves you with a fundability report you can share."
  - Buttons: **Register** (primary, filled) · **Sign in** (secondary, outlined)
- **(proposed) additional blocks:** "How it works" in three steps (Upload → Answer → Report), a sample report preview with the three verdicts, the benefits list from §1.2, a privacy reassurance line, FAQ.
- **SEO:** title "RaiseOS"; description "A venture-scale read on an early-stage company, from the deck and a short intake."

### 7.2 Register — `/register`

- **Blocks:** kicker "Create your account" · H1 (serif): "Register an email to keep this work." · intro: "Assessments stay on this account. You can leave and pick up the same report later." · Email field · Password field (minimum 8 characters) · **Create account** (primary) · **Continue with Google** (secondary) · footer line "Already registered? Sign in."
- **States:** default · field validation · error message from server (inline, red, `role="alert"`) · **check your email** confirmation: "Check your inbox to confirm the address, then sign in." · Google unavailable ("Google sign-in is not available on this project").

### 7.3 Sign in — `/login`

- **Blocks:** kicker "Welcome back" · H1 (serif): "Sign in with your email." · same intro line as Register · Email · Password · **Sign in** (primary) · **Continue with Google** (secondary) · footer line "New here? Register an email."
- **States:** default · wrong credentials error · server not configured error · loading on submit. **(proposed)** "Forgot password?" link.

### 7.4 Assessments home — `/home`

- **Purpose:** start a new assessment or reopen an old one.
- **Blocks:**
  - H1 (serif): "Your assessments"
  - Subhead: "Start a new one, or open a report you already finished."
  - **Upload zone** (large dashed card, min height 192px):
    - Title (serif): "Drop the deck"
    - Help: "PDF or PPTX, up to 50MB. Keynote needs a PDF export. The file stays in your private storage and is not used to train a model."
    - Button: "Choose a file" → "Reading the deck…" while uploading
  - **Assessment list** (hairline-divided rows): left = company name (serif, 24px) or deck file name or "Untitled assessment"; right = verdict label if complete, otherwise status ("intake", "followup").
- **States to design:**
  - Empty (first visit): upload zone only. **(proposed)** a short "what happens next" note.
  - Drag-over highlight on the upload zone **(design needed; not styled today)**.
  - Uploading.
  - Upload errors: "Upload a PDF or PPTX deck." · "That file is not a PDF." · "That file is not a PPTX." · "That file could not be read. Export a fresh PDF and try again." · "The deck could not be stored." · "Upload failed."
  - Populated list. **(proposed)** verdict shown as a coloured badge; friendlier status labels ("In progress — intake", "Waiting on follow-ups"); updated date.

### 7.5 Intake wizard — `/a/:id`

- **Purpose:** confirm and complete the deck data across five pillars.
- **Persistent blocks on every step:**
  - Top row: "N of 5" (left) · prefill mode label "Rules prefill" / "Model-assisted prefill" (right)
  - Thin progress bar (accent fill)
  - Optional warning (amber): "Little text came out of this deck. Image-only slides have to be filled in by hand."
  - Kicker (pillar name) + H1 question (serif, 36px)
  - Fields with label on the left and **"From deck"** tag (accent) on the right when prefilled
  - Footer: **Back** (text button, disabled on step 1) · **Next** (primary pill) → on step 5 **Continue**; label "Saving…" while saving
- **Steps and fields** (placeholders shown in grey are real):

| Step | Kicker | Headline | Fields (type, placeholder) |
|---|---|---|---|
| 1 | Company | Who is building this? | Legal name (text, "Northstar Labs Inc.") · Founding date (text, "March 2024") · Headquarters (text, "Austin, TX") · Team size (text, "6") · Founder backgrounds (multi-line, "Domain expertise, prior companies") |
| 2 | Problem and solution | What hurts, and what do you sell? | Pain (multi-line) · Target customer (text, "Who pays") · Value proposition (multi-line, "Why they switch") · Solution (multi-line) · TAM ("$1.2B") · SAM ("$400M") · SOM ("$40M") |
| 3 | Go-to-market | How does a dollar get in? | Customer type (select: Enterprise B2B / SMB / mid-market / Consumer / Other) · Price or ACV ("$50/month or $24k ACV") · CAC ("$4,000") · LTV ("$18,000") · Distribution channels ("Outbound, PLG, partners") · Sales cycle ("90 days") |
| 4 | Traction | What is already true? | MRR or GMV ("$12,000 MRR") · MoM growth ("18%") · Active users ("40") · Churn ("2%") |
| 5 | Cap table | Who owns the company? | Total raised ("$1.5M") · Stage (select: Pre-seed / Seed / Series A / Other) · Valuation or cap ("$12M cap") · Founder equity ("70%") · Existing investors ("Names, or none yet") |

- **Input style:** underline only (no box), 18px text, accent underline on focus. **(proposed)** grouping TAM/SAM/SOM and CAC/LTV side by side on desktop.
- **States:** prefilled vs empty fields · edited (tag removed) · saving · save error ("Could not save this assessment.") · finishing error ("Could not finish the assessment.") · model prefill arriving after the page loads (fields fill in quietly; **design a subtle highlight** for newly filled fields).

### 7.6 Follow-up — `/a/:id/follow-up`

- **Purpose:** answer the questions a partner would ask.
- **Blocks:**
  - Kicker: "Follow-up"
  - H1 (serif): "A few things a partner would ask."
  - Subhead: "N question(s). This is the last step."
  - For each question (1–4): question text (serif, 24px) · reason (small, muted) · multi-line answer (4 rows, underline style)
  - Primary button: **See the assessment** → "Writing the report…"
- **States:** 1, 2, 3 or 4 questions · empty answers allowed · submitting · error ("Could not save the report.", "Assessment not found.").

### 7.7 Report (owner) — `/a/:id/report`

- **Purpose:** deliver the verdict and next steps.
- **Blocks, top to bottom:**
  1. Toolbar (hidden on print): kicker "Venture scalability report" · **Copy share link** (outlined; becomes "Link copied") · **Download PDF** (filled)
  2. Company name (small, muted)
  3. **Verdict** as H1 (serif, 48px): "Highly Fundable" / "Borderline/Niche" / "Bootstrapping Recommended"
  4. Rationale paragraph (18px, relaxed line height, max ~65 characters per line)
  5. Source label (tiny caps): "Narrative from the rules" or "Narrative phrased by the model"
  6. **Venture scale** section (H2 + paragraph)
  7. **Green flags** and **Red flags** — two cards side by side on desktop, stacked on mobile; green title in accent, red title in danger
  8. **SWOT** — 2×2 grid on desktop (Strengths, Weaknesses, Opportunities, Threats), stacked on mobile, each with a top hairline
- **Design needs:** a verdict treatment for each of the three verdicts (colour + icon + text, never colour alone); print/PDF layout at A4 and US Letter.
- **(proposed):** "Start a new assessment" link at the bottom; date of the report; "What to fix first" summary built from red flags.

### 7.8 Shared report — `/s/:token`

- **Purpose:** let anyone with the link read the finished report.
- **Same layout as 7.7** but with no share/PDF toolbar buttons (the reader can still print from the browser) and the signed-out header.
- **States:** report shown · "This report is not available." (bad or unfinished link) · "Sharing is not configured." (server set-up issue).
- **(proposed):** a soft call to action at the bottom for readers: "Get a read on your own company → Register".

---

## 8. Design system and tokens (as built)

### 8.1 Colour

| Token | Hex | Use |
|---|---|---|
| `paper` | `#F3EFE6` | Page background |
| `card` | `#FBF9F5` | Cards, upload zone |
| `ink` | `#1A1714` | Primary text, primary button fill |
| `muted` | `#6E675E` | Secondary text, kickers, placeholders |
| `line` | `#E3DCD0` | Hairlines, borders, progress track |
| `accent` | `#0E6B52` | Progress fill, focus, "From deck", green flags, Highly Fundable |
| `warn` | `#8A4F12` | Warnings, Borderline/Niche |
| `danger` | `#8D2F2F` | Errors, red flags, Bootstrapping Recommended |

Primary button text uses `paper` on `ink`. **Dark mode:** not built; **(proposed)** mirror the same token names.

### 8.2 Typography

| Role | Font | Size (desktop) |
|---|---|---|
| Display / landing H1 / verdict | Fraunces (serif) | 48px |
| Page H1 | Fraunces | 36px |
| Section H2, list titles, follow-up questions | Fraunces | 24px |
| Upload title | Fraunces | 30px |
| Body large | Outfit (sans) | 18px |
| Body | Outfit | 16px |
| Small / labels | Outfit | 14px |
| Kicker | Outfit, uppercase, letter-spacing 0.16em | 14px |
| Micro label | Outfit, uppercase, letter-spacing 0.14em | 12px |

Body line height ≥ 1.5. Wordmark: Fraunces 20px, tight tracking.

### 8.3 Shape, spacing, elevation

- **Buttons:** fully rounded pills. Primary = ink fill; secondary = 1px `line` border. Padding 12px × 20–24px.
- **Cards:** 16px radius, 1px `line` border, `card` fill, 20px padding. No shadows; borders only.
- **Inputs:** no box, 1px bottom border, transparent background.
- **Spacing:** 4px base (4, 8, 12, 16, 24, 32, 40, 48).
- **Breakpoints:** mobile < 640px (single column), ≥ 640px enables two-column flags and SWOT grids.
- **Motion:** minimal; respect `prefers-reduced-motion`.

---

## 9. Components to design (with variants and states)

- **Wordmark**
- **Header** (signed-in / signed-out; mobile)
- **Button** — primary, secondary (outline), text; default, hover, focus, disabled, loading label
- **Text input**, **multi-line input**, **select** — empty, filled, focus, error, disabled
- **Field label row** with optional **"From deck" tag**
- **Prefill mode label** ("Rules prefill" / "Model-assisted prefill")
- **Progress bar** (5 steps)
- **Upload drop zone** — idle, drag-over, uploading, error
- **Inline alert** — warning (amber) and error (red), with `role="alert"`
- **Assessment list row** — in progress / complete with verdict badge
- **Follow-up question block** (question, reason, answer)
- **Verdict heading** — three variants
- **Flag card** — green / red
- **SWOT cell**
- **Copy-link button** with "Link copied" confirmation
- **404 / not available** empty state

---

## 10. Content and microcopy

- **Voice:** a candid, experienced partner. Short sentences. No hype, no jargon beyond standard venture terms (TAM, CAC, LTV, ACV, MoM, PLG).
- **Headlines as questions** in the intake ("What is already true?").
- **Errors** say what happened and what to do ("That file could not be read. Export a fresh PDF and try again.").
- **Buttons** are short verbs: "Create account", "Sign in", "Continue with Google", "Choose a file", "Next", "Continue", "See the assessment", "Copy share link", "Download PDF".
- **Progress labels** use an ellipsis: "Saving…", "Reading the deck…", "Writing the report…".

---

## 11. Accessibility (WCAG 2.2 AA)

- Visible focus rings on every interactive element (the current underline-only focus on inputs needs a stronger ring for keyboard users).
- Every field has a real `<label>`; errors use `role="alert"`.
- Verdicts and flags use text and an icon, not colour alone.
- Check contrast of `muted` on `paper` and `accent` on `card` for small text.
- The upload zone must work by keyboard (it is a labelled file input).
- Touch targets ≥ 44 × 44 px on mobile.

---

## 12. Handoff checklist

- [ ] Foundations: colour and type tokens from §8
- [ ] Components from §9 with all states
- [ ] All screens in §7 at 375px and 1280px
- [ ] Every state listed per screen (empty, loading, error)
- [ ] Three verdict variants of the report
- [ ] Print/PDF layout of the report
- [ ] Clickable prototype: upload → intake (5 steps) → follow-ups → report → share link
- [ ] Separate frames for **(proposed)** items so they are not confused with built scope

---

## 13. Open questions

1. Do we keep the warm editorial palette, or is there an existing brand to apply?
2. Should the landing page grow into a full marketing page (how it works, sample report, FAQ)?
3. Should founders be able to edit answers and re-run a report?
4. Should share links be revocable?
5. Is dark mode needed for MVP?

---

## Document history

| Version | Date | Author | Notes |
|---|---|---|---|
| 1.0 | 2026-11-06 | Engineering handoff | Initial skeleton for designer sharing |
| 2.0 | 2026-11-12 | Engineering handoff | Filled with the built product: features, functions, benefits, real screens, fields, copy, logic and tokens |
