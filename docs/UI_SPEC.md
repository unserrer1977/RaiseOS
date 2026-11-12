# Raise Insight by Angel OS — UI specification (designer handoff)

**Version:** 1.0  
**Last updated:** 2026-11-06  
**Audience:** Product design, visual design, content design, design engineering  

This document is the single source of truth for what to design for **Raise Insight by Angel OS**. The codebase today is a placeholder; **product goals in §2 must be confirmed with stakeholders** before high-fidelity visuals are locked.

---

## 1. Purpose of this document

- Align designers on **scope**, **user outcomes**, and **screen inventory** before pixels.
- Give engineering a **contract for layout, states, and accessibility** so implementation stays consistent.
- Be **shareable as-is** (export to PDF or link this file).

**Out of scope for v1 of this spec:** API contracts, database schema, analytics event naming (can be added in an appendix later).

---

## 2. Product definition (confirm with stakeholder)

**Product name:** Raise Insight by Angel OS  

**One-line pitch (draft — replace):**  
A focused workspace that helps teams **[define primary job-to-be-done]** with clear **[core objects, e.g. campaigns, donors, goals]** and actionable **[primary workflows]**.

**Primary users (draft — replace):**

| Persona | Goal | Pain today |
|--------|------|------------|
| e.g. *Organizer* | … | … |
| e.g. *Contributor / viewer* | … | … |
| e.g. *Admin* | … | … |

**Non-goals for MVP (examples):** native mobile apps, complex offline mode, multi-tenant white-label (unless explicitly in scope).

**Success metrics (optional for design, useful for prioritization):** activation, weekly retention, task completion rate, support tickets.

> **Action for stakeholder:** Fill the table and pitch above, or attach a PRD link. Designers should not finalize IA (§4) until this section is agreed.

---

## 3. Design principles

1. **Clarity over density** — one primary action per view where possible.  
2. **Progressive disclosure** — advanced options behind explicit “More” / settings.  
3. **Trust & transparency** — statuses, timestamps, and who did what are visible where decisions matter.  
4. **Accessible by default** — WCAG 2.2 AA target for color contrast, focus, labels, and motion preferences.  
5. **Responsive first** — mobile web is a first-class layout, not a shrunken desktop.

---

## 4. Information architecture (IA)

**Assumption:** web app with authenticated and marketing surfaces. Adjust if Raise Insight is internal-only or single-page.

```text
/                      Marketing / landing (optional for MVP)
/sign-in               Authentication
/app                   Authenticated shell (sidebar or top nav)
/app/dashboard         Home / overview
/app/[primary-object]  List + detail pattern (e.g. campaigns, projects)
/app/settings          User settings
/app/settings/workspace Org / workspace settings (if multi-user)
```

**Navigation model (pick one in design):**

- **A.** Persistent **left sidebar** + top bar (global search, user menu) — best for many sections.  
- **B.** **Top-only** nav — best for few sections (≤4 primary).  

Deliverable: **site map diagram** in Figma + this list kept in sync.

---

## 5. Global layout & shell

### 5.1 Authenticated app shell

**Regions:**

| Region | Content | Behavior |
|--------|---------|----------|
| **Top bar** | Product logo, environment badge (staging/prod), global search (optional MVP), notifications (optional), **user menu** | Sticky on scroll (optional) |
| **Side nav** | Primary sections, collapsible on tablet/desktop | Collapse to icons on narrow desktop; **hamburger + bottom sheet** pattern on mobile |
| **Main** | Page title, actions, content | Max content width token (see §8) for readability |
| **Footer (in-app)** | Optional: links to docs, status, legal | Minimal for MVP |

**User menu:** Profile, account settings, workspace switcher (if applicable), sign out.

### 5.2 States (global)

- **Loading:** Skeleton for shell + page (avoid blocking spinners only).  
- **Auth required:** Redirect to `/sign-in` with return URL.  
- **Permission denied:** Inline empty state or dedicated “no access” page.  
- **Workspace empty (new user):** Guided empty state with 1 CTA (e.g. “Create your first …”).

---

## 6. Core user journeys (for journey maps & prototypes)

Design should cover **happy path + one failure path** per journey.

1. **Onboard:** Sign up / sign in → land in app → complete minimal setup (if any) → reach “ready” dashboard.  
2. **Primary job:** e.g. create → configure → publish/track **[primary object]** (replace with real workflow).  
3. **Collaborate (if multi-user):** invite → accept → permission change.  
4. **Recover:** wrong password, expired session, validation errors on forms.  
5. **Leave:** sign out, delete account (if in scope — confirm legal).

---

## 7. Screen inventory (MVP)

Each screen below lists **purpose**, **must-have UI blocks**, and **states**. Rename or split screens once §2 is final.

### 7.1 Marketing / landing (`/`)

- **Purpose:** Explain value, build trust, drive sign-in or signup.  
- **Blocks:** Hero, social proof (optional), feature list, FAQ (optional), primary CTA, footer.  
- **States:** N/A (static). **SEO:** title, meta description, OG image.

### 7.2 Sign in / sign up (`/sign-in`)

- **Purpose:** Authenticate.  
- **Blocks:** Email + password and/or OAuth buttons, link to create account / forgot password, legal links.  
- **States:** Field validation, auth error (generic message + support path), loading on submit, **rate-limit / locked** (copy TBD).

### 7.3 Dashboard (`/app/dashboard`)

- **Purpose:** Orientation — “what needs attention” + entry points to primary workflows.  
- **Blocks:** Greeting, summary cards or list of “recent / upcoming”, primary CTA, shortcuts.  
- **States:** Empty (new user), populated, partial load (skeleton), error fetching data.

### 7.4 List view — primary object (`/app/[objects]`)

- **Purpose:** Find and open items quickly.  
- **Blocks:** Page title + primary action, **filters** (or simple search MVP), sort, table or card list, pagination or infinite scroll (decide one).  
- **States:** Empty, no search results, loading, error, **bulk actions** (if in scope).

### 7.5 Detail / workspace — primary object (`/app/[objects]/:id`)

- **Purpose:** View and edit the thing users care about.  
- **Blocks:** Header (title, status badge, primary/secondary actions), tabs or sections for sub-entities, activity/history sidebar (optional MVP).  
- **States:** Loading, not found (404), read-only vs edit, concurrent edit warning (if applicable), save success/error.

### 7.6 Create / edit modal or full-page form

- **Purpose:** Create or update records with validation.  
- **Blocks:** Stepped wizard **or** single form; sticky footer with Cancel / Save.  
- **States:** Dirty form (unsaved changes prompt), validation, async submit, success redirect or toast.

### 7.7 Settings — user (`/app/settings`)

- **Purpose:** Profile, notifications, security.  
- **Blocks:** Sections with forms; destructive zone (e.g. delete account) visually separated.  
- **States:** Save feedback, confirmation modals for destructive actions.

### 7.8 Settings — workspace / org (`/app/settings/workspace`)

- **Purpose:** Workspace name, members, billing hook (if applicable).  
- **Blocks:** Member list, invite flow, role labels.  
- **States:** Invite pending, role change confirmation, last admin warning.

---

## 8. Design system & UI tokens

Deliver in **Figma variables** (or equivalent) aligned to implementation tokens later.

### 8.1 Breakpoints (suggested)

| Name | Width | Notes |
|------|-------|--------|
| `sm` | 0–639px | Mobile; touch targets ≥ 44×44 px |
| `md` | 640–1023px | Tablet |
| `lg` | 1024–1439px | Desktop |
| `xl` | 1440px+ | Large desktop |

**Content max width:** 720–1200px for long-form; use a single `max-w-content` token for consistency.

### 8.2 Color

- **Brand:** primary, primary-hover, on-primary.  
- **Semantic:** success, warning, danger, info (each with text-friendly contrast variants).  
- **Surface:** page, elevated, border, muted.  
- **Text:** primary, secondary, disabled, link.  
- **Dark mode:** mirror semantic roles (same token names; different values).

### 8.3 Typography

- **Font families:** one for UI, optional second for marketing only.  
- **Scale (example):** Display / H1 / H2 / H3 / Body / Body small / Caption / Mono (for codes/IDs).  
- **Line height:** body ≥ 1.5 for readability.

### 8.4 Spacing & radius

- **Spacing scale:** 4px base (4, 8, 12, 16, 24, 32, 48, 64).  
- **Radius:** sm / md / lg; consistent cards, inputs, buttons.

### 8.5 Elevation & borders

- Define **shadow levels** or **border-only** system for cards, popovers, modals.

### 8.6 Motion

- **Duration:** fast (100–150ms) for micro-interactions; **respect `prefers-reduced-motion`**.  
- Avoid motion-only cues for state changes.

---

## 9. Components (build list)

Design should include **variants and states** for:

- Buttons (primary, secondary, ghost, danger; loading; icon-only with `aria-label`)
- Inputs (text, textarea, select/combobox, checkbox, radio, switch)
- Validation messaging (inline error, hint text)
- Toasts / inline alerts
- Modal / drawer / bottom sheet (mobile)
- Tables (sortable header, row hover, empty row)
- Cards
- Tags / badges (including semantic colors)
- Tabs
- Breadcrumbs (if hierarchy deep)
- Skeleton loaders
- **Empty states** (illustration optional; always one primary CTA + short copy)

---

## 10. Content & microcopy

- **Voice:** clear, direct, human; avoid jargon unless domain-standard.  
- **Errors:** say what happened + what to do next (retry, contact support).  
- **Buttons:** verb-first (“Create campaign”, “Send invite”).  
- **Date/time:** relative for recency (“2 hours ago”), absolute on hover or detail views.

Provide **copy deck** (Google Sheet or Figma comments) keyed to screen IDs from §7.

---

## 11. Accessibility (WCAG 2.2 AA target)

- Visible **focus rings** on all interactive elements; logical tab order.  
- Form fields: associated `<label>`, errors linked with `aria-describedby`.  
- Color is not the only indicator of state (use icons/text too).  
- Touch targets ≥ 44×44 px on mobile.  
- Charts (if any): data table alternative or screen-reader summary.

---

## 12. Assets & handoff checklist

**From design:**

- [ ] Figma file with pages: Foundations, Components, Templates, Flows (prototypes)  
- [ ] Variables / styles exported or documented  
- [ ] All screens in §7 with **empty / error / loading**  
- [ ] Responsive examples at least **sm + lg** for key templates  
- [ ] Icon set (SVG, 24px grid) or approval to use **[library name]**  
- [ ] Optional: marketing illustrations style guide  

**Engineering needs:**

- Redlines or dev mode specs for spacing (or token names only — no px duplication)  
- Naming convention for layers that map to components (e.g. `Button/Primary/LG`)

---

## 13. Open questions (track in Figma or issue tracker)

1. What is the **exact primary object** and **core workflow** for Raise Insight?  
2. **Multi-user** from day one? Roles?  
3. **Mobile web** priority vs desktop-only for MVP?  
4. **Internationalization** (languages, RTL) in MVP or later?  
5. **Brand:** existing logo, colors, and typography, or greenfield?  
6. **Integrations** exposed in UI for MVP (e.g. OAuth providers, webhooks)?  

---

## Document history

| Version | Date | Author | Notes |
|---------|------|--------|--------|
| 1.0 | 2026-11-06 | Engineering handoff | Initial skeleton for designer sharing |
