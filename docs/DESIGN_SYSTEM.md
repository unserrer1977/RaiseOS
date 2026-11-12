# Raise Insight by Angel OS — Design System

**Version:** 2.0 · **Last updated:** 2026-11-12
**Source of truth:** the live app. Values come from `app/globals.css`, `app/layout.tsx` and `components/*`. If the app changes, update this file.

Raise Insight is an Angel OS product and uses the Angel OS design system. The tokens here are the light-theme values from the Angel OS app (`src/index.css` in the AngelOS codebase), carried over under this app's own token names.

---

## 1. The feel in one paragraph

Quiet and dense, like a well-made working tool. A warm off-white canvas, white cards, thin warm-grey lines, near-black ink and **one golden-yellow accent**. Geist does all the text; Geist Mono does small labels and step numbers. Corners are small, borders are hairlines, shadows are soft. Green, amber and red appear only as soft pills and notices that mean something.

**Five rules that make it look like Angel OS:**

1. Warm off-white canvas, white cards on top.
2. Geist for everything; Geist Mono for small uppercase labels and numbers. No serif.
3. One accent: golden yellow. Use it for one call to action on a dark band, progress, focus rings and "from deck" tags. Never as text on a light background.
4. Small radii (6–8px), hairline borders, a soft `shadow-sm` on cards and inputs.
5. Primary buttons are near-black with white text. Status is shown with soft tinted pills plus an icon or a word.

---

## 2. Colour

### 2.1 Tokens

| Token | Value | Angel OS source | Role |
|---|---|---|---|
| `paper` | `hsl(60 13% 95%)` | `--background` | Page canvas |
| `card` | `hsl(0 0% 100%)` | `--card` | Cards, inputs, alternate section band |
| `secondary` | `hsl(60 12% 92%)` | `--secondary` | Tab tracks, neutral status pills |
| `ink` | `hsl(218 20% 8%)` | `--foreground` / `--primary` | Text, primary buttons, dark bands |
| `muted` | `hsl(219 10% 32%)` | `--sidebar-foreground` | Secondary text, labels, nav links |
| `placeholder` | `hsl(219 7% 49%)` | `--muted-foreground` | Placeholder text only |
| `line` | `hsl(60 10% 88%)` | `--border` | Dividers, card borders |
| `line-strong` | `hsl(60 8% 81%)` | `--input` | Input and secondary-button borders, drop zones |
| `accent` | `hsl(45 96% 48%)` | `--accent` / `--ring` | Gold: focus ring, progress, CTA on dark |
| `accent-soft` | `hsl(47 90% 88%)` | `--accent-soft` | Background of gold tags |
| `accent-ink` | `hsl(44 100% 21%)` | `--accent-ink` | Text on `accent-soft` |
| `success` | `hsl(157 79% 27%)` | `--success` | Positive / "venture fit" |
| `warn` | `hsl(34 100% 31%)` | `--warning` | Caution / "one gap" |
| `danger` | `hsl(7 72% 44%)` | `--destructive` | Problems, errors, "structural gaps" |
| `success-tint`, `warn-tint`, `danger-tint` | light tints | soft pills | Background behind the matching colour |

`muted` uses the darker Angel OS secondary ink rather than `--muted-foreground`, because this app sets whole paragraphs in it and the lighter grey does not reach 4.5:1 on the canvas.

### 2.2 How colour is used

- Most of any screen is canvas, white, ink and muted. Gold appears in small doses.
- Semantic colours always come with an icon or a word, never colour alone.
- Notices use the tint as background, the full colour for text, and a faint border of the full colour.
- Dark bands (closing CTA) use `ink` with white text and one gold button.
- Print / PDF: the background becomes white.
- Angel OS has a dark theme. This app does not ship one yet.

### 2.3 Verdict colours

| Verdict | Kicker | Colour | Icon |
|---|---|---|---|
| Highly Fundable | "Venture fit" | `success` | Check in circle |
| Borderline/Niche | "One gap" | `warn` | Minus in circle |
| Bootstrapping Recommended | "Structural gaps" | `danger` | Warning triangle |

---

## 3. Typography

| Role | Font | Where |
|---|---|---|
| Text and headings | **Geist** (variable, Google Fonts) | Everything |
| Labels and numbers | **Geist Mono** | Eyebrows, micro labels, step numbers, the "by Angel OS" line |

Numbers are tabular everywhere (`font-variant-numeric: tabular-nums` on `body`).

| Style | Size (mobile → desktop) | Weight | Tracking | Use |
|---|---|---|---|---|
| Display | 36 → 56px | 600 | −0.03em | Landing hero |
| H1 verdict | 36 → 48px | 600 | −0.02em | Report verdict |
| H1 page | 30 → 36px | 600 | −0.02em | Page and step titles |
| H2 | 30px | 600 | −0.02em | Landing sections |
| H2 small | 20px | 600 | −0.01em | Report sections, card titles |
| Row title | 16–18px | 500 | 0 | List rows, questions |
| Lead | 18 → 19px | 400 | 0 | Intro under a headline, `muted` |
| Body | 16px | 400 | 0 | Default |
| Small | 13–14px | 400 | 0 | Hints, meta, notices |
| **Eyebrow** | 12px Geist Mono, UPPERCASE | 400 | 0.08em | Label above a headline, `muted` |
| Step number | 14px Geist Mono | 400 | 0 | "01", "02", "03" in `muted` |

---

## 4. Layout

Unchanged from before: 4px spacing base; containers of 1152px (marketing), 768px (app), 672px (reading) and 448px (forms); mobile first; touch targets at least 44px.

Sections are separated by full-width hairlines. One white band per page at most. An "ink rule" (`border-top: 1px solid ink`) sits above numbered steps and SWOT columns.

---

## 5. Shape and elevation

| Token | Value | Use |
|---|---|---|
| `rounded-md` | 6px | Buttons, inputs, notices |
| `rounded-lg` | 8px | Cards, drop zones, dark panels, tab track |
| `rounded-full` | pill | Badges, pills, progress bar only |
| `shadow-sm` | `0 1px 2px hsl(216 20% 8% / 0.05)` | Cards, inputs, active tab |

---

## 6. Components

| Component | Look |
|---|---|
| **Primary button** | `ink` fill, white text, 6px radius, medium weight, 44–48px tall |
| **Secondary button** | Transparent, `line-strong` border, `ink` text |
| **CTA on dark** | `accent` (gold) fill, `ink` text. One per page. |
| **Input / select / textarea** | White, `line-strong` border, 6px radius, `shadow-sm`, 16px text; label above in 14px. Focus: `ink` border plus a gold ring. |
| **Verdict pill** | Soft tint background, text in the verdict colour, 12px medium, icon |
| **Status pill** | `secondary` background, `muted` text |
| **Source tag** ("From deck") | `accent-soft` background, `accent-ink` text |
| **Notice** | 6px radius, tint background, coloured text, faint coloured border, icon |
| **Card** | White, `line` border, 8px radius, `shadow-sm`, 24–32px padding |
| **Tabs** | `secondary` track with 8px radius; active tab is a white chip with `shadow-sm` |
| **Drop zone** | White, 1.5px dashed `line-strong`; on drag-over gold border and `accent-soft` fill |
| **Progress bar** | 4px, `line` track, gold fill |
| **Header** | Wordmark left, links right, no background or border |
| **Footer** | One row, 14px `muted`, "© YEAR Raise Insight by Angel OS" |

---

## 7. Iconography

Outline icons on a 24×24 grid, 2px stroke, round caps, `currentColor` (Lucide style, as in Angel OS). Decorative icons get `aria-hidden="true"`.

---

## 8. Brand and voice

### 8.1 Name and wordmark

- Full name: **Raise Insight by Angel OS**. Short name in running copy: **Raise Insight**.
- Wordmark: "Raise Insight" in Geist semibold, 18px, tight tracking, followed by "BY ANGEL OS" in Geist Mono, 11px, uppercase, `muted`. The angel flow adds a small gold "For angels" tag.
- The wordmark is type only. The Angel OS logo mark is not used in this app yet.

### 8.2 Voice

Write like a frank, kind investor: direct, specific, short. Sentence case headings, verb-first buttons, plain numbers, no hype, no exclamation marks, no emoji. Use curly quotes and British short dates ("12 Nov").

---

## 9. Accessibility and motion

- Focus ring: 2px gold outline, 2px offset. Inputs also darken their border to `ink` so the change is visible without relying on the gold alone.
- Every input has a visible label. State is never shown by colour alone.
- Motion is minimal (colour and width transitions, about 150ms) and respects `prefers-reduced-motion`.

---

## 10. Quick checklist for a new asset

- [ ] Warm off-white canvas, white cards
- [ ] Geist for text, Geist Mono for small labels
- [ ] Gold used sparingly, never as text on a light background
- [ ] Near-black primary buttons with small radii
- [ ] Hairline borders, soft shadows, no gradients
- [ ] Soft tinted pills for status, always with an icon or word
- [ ] Says "Raise Insight by Angel OS" on first mention
