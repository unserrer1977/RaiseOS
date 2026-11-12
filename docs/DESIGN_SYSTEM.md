# RaiseOS Design System

**Version:** 1.0 · **Last updated:** 2026-11-12
**Source of truth:** the live app. Values come from `app/globals.css`, `app/layout.tsx` and `components/*`. If the app changes, update this file.

Use this document to keep anything outside the app (marketing sites, landing pages, emails, slide decks, social images, PDFs) looking and sounding like RaiseOS.

---

## 1. The feel in one paragraph

RaiseOS looks like a **well-printed investment memo**, not a SaaS dashboard. Warm off-white paper, near-black ink, one deep green accent. Big serif headlines carry the voice, a clean geometric sans does the work. Layouts are calm and roomy, divided by thin rules rather than boxes and shadows. Buttons are pills. Colour is used **only to mean something** (good / caution / problem), never for decoration.

**Five rules that make it look like RaiseOS:**

1. Paper background (`#f3efe6`), never pure white on screen.
2. Serif (Fraunces) for headlines, sans (Outfit) for everything else.
3. One accent: deep green `#0e6b52`. No gradients, no extra brand colours.
4. Hairline borders and rules instead of shadows. **No drop shadows.**
5. Fully rounded pill buttons, with near-black as the primary button colour (not green).

---

## 2. Colour

### 2.1 Tokens

| Token | Hex | Role |
|---|---|---|
| `paper` | `#f3efe6` | Page background |
| `card` | `#fbf9f5` | Raised surfaces: cards, panels, alternate section bands |
| `ink` | `#1a1714` | Body text, headlines, primary buttons, dark CTA bands |
| `muted` | `#6e675e` | Secondary text, labels, captions, nav links |
| `placeholder` | `#8f877c` | Input placeholder text only |
| `line` | `#e3dcd0` | Default dividers, card borders |
| `line-strong` | `#cfc5b4` | Secondary button borders, input borders, dashed drop zones |
| `accent` | `#0e6b52` | Positive / "venture fit", focus rings, step numbers, icons |
| `accent-tint` | `#e6f0eb` | Background behind accent text (badges, success notices) |
| `warn` | `#8a4f12` | Caution / "one gap" |
| `warn-tint` | `#f6ebdd` | Background behind warn text |
| `danger` | `#8d2f2f` | Problems / errors / "structural gaps" |
| `danger-tint` | `#f4e4e1` | Background behind danger text |

### 2.2 How colour is used

- **~90% of any screen is paper + ink + muted.** Accent appears in small doses.
- **Semantic colours always come with an icon or a word**, never colour alone (e.g. ✓ "Venture fit", ⚠ "Structural gaps").
- **Tinted notices** use the tint as background, the full colour for text, and a 25–30% opacity border of the full colour.
- **Dark bands** (closing CTA) invert: `ink` background, `paper` text, `paper` button with `ink` text.
- **Print / PDF:** background becomes pure white; everything else stays.
- There is **no dark mode** in the platform today. Do not invent one for external assets.

### 2.3 Verdict colours

The product's three outcomes each own a colour. Keep this mapping everywhere.

| Verdict | Kicker | Colour | Icon |
|---|---|---|---|
| Highly Fundable | "Venture fit" | `accent` | Check in circle |
| Borderline/Niche | "One gap" | `warn` | Minus in circle |
| Bootstrapping Recommended | "Structural gaps" / "Two or more gaps" | `danger` | Warning triangle |

### 2.4 Contrast (WCAG 2.2 AA)

| Pair | Ratio | OK for |
|---|---|---|
| ink on paper | 15.6 : 1 | Everything |
| muted on paper | 4.9 : 1 | Body text ✓ |
| muted on card | 5.3 : 1 | Body text ✓ |
| accent on paper / on accent-tint | 5.6 : 1 | Body text ✓ |
| warn on paper / on warn-tint | 5.7 / 5.6 : 1 | Body text ✓ |
| danger on paper / on danger-tint | 7.1 / 6.6 : 1 | Body text ✓ |
| placeholder on paper | 3.1 : 1 | Placeholder only — never real content |
| line-strong on paper | 1.5 : 1 | Decorative borders only — never text |

---

## 3. Typography

### 3.1 Typefaces

| Role | Font | Fallback | Where |
|---|---|---|---|
| **Display / headings** | **Fraunces** (variable, Google Fonts) | `Georgia, serif` | H1–H3, wordmark, big numbers, verdict labels, CTA lines |
| **UI / body** | **Outfit** (variable, Google Fonts) | `system-ui, sans-serif` | Body, labels, buttons, nav, captions |

Load both on any website:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Outfit:wght@300..700&display=swap" rel="stylesheet">
```

Headings use Fraunces at its **regular weight (400)** — the serif carries the personality, so it is never bolded. Outfit uses 400 for text, 500 for emphasis, 600 for small uppercase labels.

### 3.2 Type scale

| Style | Font | Size (mobile → desktop) | Line height | Tracking | Use |
|---|---|---|---|---|---|
| Display | Fraunces | 48 → 64px | 1.04 | −0.02em | Landing hero only |
| H1 | Fraunces | 48 → 56px | 1.05 | −0.01em | Report verdict |
| H1 page | Fraunces | 36 → 40px | 1.25 | 0 | Page titles ("Your assessments") |
| H2 | Fraunces | 36px | 1.1 | −0.01em | Section titles |
| H2 small | Fraunces | 28px | 1.25 | 0 | Report section titles |
| H3 | Fraunces | 24–26px | 1.25 | 0 | Card titles, list item titles |
| Lead | Outfit | 18 → 19px | 1.6 | 0 | Intro paragraph under a headline (often `muted`) |
| Body | Outfit | 16px | 1.5 | 0 | Default |
| Body small | Outfit | 15px | 1.6 | 0 | Lists, buttons, nav |
| Small | Outfit | 14px | 1.45 | 0 | Hints, meta, notices |
| Caption | Outfit | 13px | 1.4 | 0 | Field hints, badges |
| **Eyebrow** | Outfit | 13px, UPPERCASE | 1.4 | **0.16em** | Small label above a headline, `muted` |
| Micro label | Outfit | 12px, UPPERCASE | 1.4 | 0.14em | Report meta, sample tags |
| Step number | Fraunces | 20px | — | 0 | "01", "02", "03" in `accent` |

**Signature pattern** — eyebrow + serif headline + muted lead:

```
FOR EARLY-STAGE FOUNDERS                    ← eyebrow, 13px caps, muted, 0.16em
A partner's read on whether this is a        ← Fraunces display, ink
venture-scale company.
Upload the deck. RaiseOS fills the intake…   ← lead, 19px, muted
```

---

## 4. Layout & spacing

### 4.1 Spacing scale (4px base)

`4 · 6 · 8 · 10 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 48 · 64 · 96`

Common rhythms in the app:

| Gap | Use |
|---|---|
| 8–12px | Icon to text, label to input, badge padding |
| 16–24px | Between stacked elements inside a block |
| 40–48px | Between major blocks on a page |
| 96px | Vertical padding of landing page sections |

### 4.2 Containers

| Container | Max width | Side padding | Use |
|---|---|---|---|
| Marketing | 1152px | 24px | Landing page sections |
| App | 768px | 20px | Signed-in pages, reports |
| Reading | 672px | — | Paragraph text inside the app |
| Form | 448px | — | Sign in / register |

Paragraphs never run wider than ~672px (about 70 characters).

### 4.3 Breakpoints

| Name | Min width | What changes |
|---|---|---|
| base | 0 | Single column, smaller headlines |
| `sm` | 640px | 2–3 column grids, larger headings, nav links appear |
| `md` | 768px | 3-column verdict cards |

Design mobile first. Touch targets are **at least 44px** tall (buttons are 44–48px).

### 4.4 Structure

- Sections are separated by **full-width hairline rules** (`1px line`), not by colour blocks. Use the `card` colour for at most one alternate band per page.
- An **"ink rule"** (`border-top: 1px solid ink`) sits above numbered steps and SWOT columns — a strong editorial divider.
- Lists of items (e.g. assessments) are rows separated by `line` borders, not cards.

---

## 5. Shape, borders, elevation

| Token | Value | Use |
|---|---|---|
| `radius-pill` | 9999px | All buttons, badges, pills |
| `radius-lg` | 20px | Hero card, drop zone, dark CTA panel |
| `radius-md` | 16px | Cards (flag lists, verdict cards) |
| `radius-sm` | 12px | Notices / alerts |
| `border` | 1px solid `line` | Cards, dividers |
| `border-strong` | 1px solid `line-strong` | Secondary buttons |
| `border-dashed` | 1.5px dashed `line-strong` | File drop zones |

**Elevation: none.** RaiseOS uses no box-shadows. Depth comes from `card` on `paper` plus a 1px border.

---

## 6. Components

Each component shows Tailwind classes (as used in the app) and plain CSS (for any other site). Plain CSS assumes the variables in §9.

### 6.1 Buttons

| Variant | Look | When |
|---|---|---|
| **Primary** | `ink` fill, `paper` text, pill, 48px tall | The one main action per view |
| **Secondary** | Transparent, `line-strong` border, `ink` text, pill | Alternative action next to primary |
| **Inverse** | `paper` fill, `ink` text | Primary action on a dark `ink` band |
| **Compact** | Same as above at 44px tall, 14px text, 16px side padding, optional 16px icon | Toolbars (Copy link, Download PDF) |
| **Text link** | `ink`, underline with 4px offset | Low-emphasis navigation ("Start a new assessment") |
| **Quiet** | `muted` text, no border | "Back" in step flows |

```html
<!-- Primary -->
<a class="inline-flex min-h-12 items-center rounded-full bg-ink px-6 text-[15px] text-paper">Register</a>
<!-- Secondary -->
<a class="inline-flex min-h-12 items-center rounded-full border border-line-strong px-6 text-[15px] text-ink">Sign in</a>
```

```css
.btn { display:inline-flex; align-items:center; gap:8px; min-height:48px; padding:0 24px;
       border-radius:9999px; font:400 15px/1 var(--font-sans); text-decoration:none; cursor:pointer; }
.btn-primary   { background:var(--ink);   color:var(--paper); border:0; }
.btn-secondary { background:transparent; color:var(--ink);   border:1px solid var(--line-strong); }
.btn-inverse   { background:var(--paper); color:var(--ink);   border:0; }
.btn:disabled  { opacity:.6; }
```

Rules: green is **not** a button colour. Labels are short and verb-first. Disabled = 60% opacity.

### 6.2 Inputs — underline style

Fields have **no box**: just a bottom border, a muted label above, large 18px text.

```html
<label class="flex flex-col gap-1 text-sm text-muted">
  Email
  <input type="email" placeholder="you@company.com"
    class="w-full border-0 border-b border-ink bg-transparent py-3 text-lg text-ink outline-none focus:border-accent">
  <span class="text-[13px]">Hint text goes here.</span>
</label>
```

```css
.field label { display:flex; flex-direction:column; gap:4px; font-size:14px; color:var(--muted); }
.field input, .field textarea, .field select {
  border:0; border-bottom:1px solid var(--ink); background:transparent;
  padding:12px 0; font:400 18px/1.5 var(--font-sans); color:var(--ink); outline:none; }
.field input:focus { border-bottom-color:var(--accent); }
```

Auth fields use an `ink` underline; long intake forms use the softer `line-strong` underline.

### 6.3 Badges & pills

| Type | Style |
|---|---|
| **Verdict pill** (outline) | 1px border + text in verdict colour, pill, 13px, 4×12px padding, 14px icon |
| **Verdict kicker** (filled) | Tint background + verdict colour text, 13px semibold, 0.04em tracking, 16px icon |
| **Status pill** | 1px `muted` border, `muted` text, 13px |
| **Source tag** | `accent-tint` bg, `accent` text, 12px, tiny icon — e.g. "From deck" |

```html
<span class="inline-flex items-center gap-1.5 rounded-full border border-accent px-3 py-1 text-[13px] text-accent">
  ✓ Highly Fundable
</span>
```

### 6.4 Notices (inline alerts)

Rounded 12px box, tint background, coloured text, faint coloured border, 18px icon aligned to the first line.

| Tone | Background | Border | Text | Icon | ARIA |
|---|---|---|---|---|---|
| Success / info | `accent-tint` | `accent` @ 30% | `accent` | Mail / check | `role="status"` |
| Warning | `warn-tint` @ 60% | `warn` @ 25% | `warn` | Alert circle | `role="status"` |
| Error | `danger-tint` @ 50% | `danger` @ 30% | `danger` | Alert circle | `role="alert"` |

```css
.notice { display:flex; align-items:flex-start; gap:10px; padding:12px 14px;
          border-radius:12px; font-size:14px; }
.notice-success { background:var(--accent-tint); color:var(--accent);
                  border:1px solid color-mix(in srgb, var(--accent) 30%, transparent); }
```

Short single-line errors under a control can skip the box: 16px icon + 14px `danger` text.

### 6.5 Cards

- **Default card:** `card` background, 1px `line` border, 16px radius, 24–28px padding. No shadow.
- **Feature card (hero):** same, 20px radius, 32px padding.
- **On a `card` band**, flip it: cards use the `paper` background.
- Card heading is either Fraunces (24–28px) or a 13px uppercase semibold label in a semantic colour with an icon.

### 6.6 Numbered steps

```
───────────────────────   ← 1px ink rule
01                        ← Fraunces 20px, accent
Upload the deck           ← Fraunces 26px
PDF or PPTX. RaiseOS…     ← Outfit 16px, muted
```

### 6.7 Dark CTA band

Full-width `ink` section (or a 20px-radius `ink` panel inside the app), Fraunces 26–36px headline in `paper`, one inverse pill button. Use once per page, at the end.

### 6.8 Drop zone

Min 224px tall, 20px radius, 1.5px dashed `line-strong` border on `card`. Accent 36px upload icon, Fraunces 30px title, 14px muted help text, primary compact button. On drag-over: `accent` border + `accent-tint` fill.

### 6.9 Progress bar

4px tall, pill-shaped, `line` track, `accent` fill, animated width.

### 6.10 FAQ / disclosure

Native `<details>`: 18px question, `muted` answer, `line` bottom border, 20px vertical padding. No chevron icons or boxes.

### 6.11 Header & footer

- **Header:** wordmark left, links right. Links are 15px `muted`, hover `ink`; the last link (the main action) is `ink`, medium weight. No background, no border, no sticky bar.
- **Footer:** one row, 14px `muted`, "© YEAR RaiseOS".

---

## 7. Iconography

- **Style:** outline, 24×24 grid, **2px stroke**, round caps and joins, `currentColor`, no fills. (Close to Lucide / Feather; use those for new icons.)
- **Sizes:** 12 (tags) · 14–16 (pills, compact buttons) · 18 (default) · 22–28 (card headers, verdict) · 36 (drop zone).
- Icons inherit the text colour beside them. Decorative icons get `aria-hidden="true"`.
- Current set: check-circle, minus-circle, warning, alert-circle, mail, file, upload-file, sparkle, link, download, flag.

---

## 8. Brand & voice

### 8.1 Wordmark

"RaiseOS" set in **Fraunces, 20px, tight tracking (−0.025em), `ink`**. No logo symbol. Capital R, capital O, capital S. Never in green, never bold, never all-caps. On dark backgrounds use `paper`.

### 8.2 Voice

Write like a **frank, kind investor**: direct, specific, short.

| Do | Don't |
|---|---|
| "Find out what a partner would say before you pitch one." | "Unlock your fundraising potential with AI!" |
| "No 'interesting, keep us posted'." | Vague hedging |
| Name the exact gap: "market size, go-to-market, cap table…" | Generic "areas for improvement" |
| Verb-first buttons: "Register", "Download PDF", "Choose a file" | "Click here", "Submit" |
| Sentence case for headings | Title Case Everywhere |
| Plain numbers: "50 MB", "at most four follow-ups" | Hype, exclamation marks, emoji |

- Headlines are often a full sentence ending in a full stop.
- Mention privacy plainly where files are involved: *"Your deck stays in private storage and is not used to train a model."*
- Use curly quotes and apostrophes (’ “ ”) and the ellipsis character (…).
- Dates: British short form — "12 Nov".

---

## 9. Starter kit for websites

Paste this into any site's CSS to get the RaiseOS foundations.

```css
:root {
  --paper: #f3efe6;
  --card: #fbf9f5;
  --ink: #1a1714;
  --muted: #6e675e;
  --placeholder: #8f877c;
  --line: #e3dcd0;
  --line-strong: #cfc5b4;
  --accent: #0e6b52;
  --accent-tint: #e6f0eb;
  --warn: #8a4f12;
  --warn-tint: #f6ebdd;
  --danger: #8d2f2f;
  --danger-tint: #f4e4e1;

  --font-sans: "Outfit", system-ui, sans-serif;
  --font-serif: "Fraunces", Georgia, serif;

  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --radius-pill: 9999px;

  --container-marketing: 1152px;
  --container-app: 768px;
  --measure: 672px;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font: 400 16px/1.5 var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, .serif { font-family: var(--font-serif); font-weight: 400; line-height: 1.15; margin: 0; }
h1 { font-size: clamp(48px, 6vw, 64px); line-height: 1.04; letter-spacing: -0.02em; }
h2 { font-size: 36px; letter-spacing: -0.01em; }
h3 { font-size: 26px; }

.eyebrow { font-size: 13px; text-transform: uppercase; letter-spacing: 0.16em; color: var(--muted); }
.lead    { font-size: 19px; line-height: 1.6; color: var(--muted); max-width: var(--measure); }
.muted   { color: var(--muted); }

.container { max-width: var(--container-marketing); margin: 0 auto; padding: 0 24px; }
.section   { padding: 96px 0; border-top: 1px solid var(--line); }
.band      { background: var(--card); border-block: 1px solid var(--line); }
.band-dark { background: var(--ink); color: var(--paper); }

.card { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 28px; }

::placeholder { color: var(--placeholder); }

:where(a, button, input, select, textarea, summary):focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
  border-radius: 2px;
}

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}

@media print {
  body { background: white; }
}
```

**Using Tailwind v4?** Copy the `:root` and `@theme inline` blocks from `app/globals.css` and you get the same utility names as the app (`bg-paper`, `text-ink`, `text-muted`, `border-line`, `bg-accent-tint`, `font-serif`…).

---

## 10. Motion & accessibility

- Motion is minimal: colour transitions on hover/drag, width transition on progress bars. ~150ms, ease. No bouncing, parallax or entrance animations.
- Respect `prefers-reduced-motion`.
- Focus ring: **2px solid accent, 4px offset** on every interactive element.
- Every input has a visible `<label>`; hints are linked with `aria-describedby`.
- State is never shown by colour alone — always an icon and/or words.
- Touch targets ≥ 44px.

---

## 11. Quick checklist for a new asset

- [ ] Background is paper `#f3efe6` (white only for print)
- [ ] Headlines in Fraunces regular, body in Outfit
- [ ] Only one accent colour, used sparingly and with meaning
- [ ] Pill buttons; primary is near-black, not green
- [ ] Thin rules and borders, no shadows, no gradients
- [ ] Eyebrow → serif headline → muted lead at the top
- [ ] Text width ≤ ~70 characters
- [ ] Copy is direct, sentence case, verb-first buttons
- [ ] Contrast checked (muted text only on paper or card)
