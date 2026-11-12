import {
  type CustomerType,
  type FieldSource,
  type Intake,
  type Stage,
  emptyIntake,
} from "@/lib/types";

const THIN_TEXT = 80;

const LINE_RULES: { path: string; pattern: RegExp }[] = [
  { path: "company.legalName", pattern: /^(?:legal name|company name)\s*[:\-]\s*(.+)$/i },
  { path: "company.foundingDate", pattern: /^(?:founded|founding date|incorporated)\s*[:\-]\s*(.+)$/i },
  { path: "company.headquarters", pattern: /^(?:headquarters|hq|based in)\s*[:\-]\s*(.+)$/i },
  { path: "company.teamSize", pattern: /^(?:team size|headcount|employees)\s*[:\-]\s*(.+)$/i },
  { path: "company.founderBackgrounds", pattern: /^(?:founders?|founder backgrounds?)\s*[:\-]\s*(.+)$/i },
  { path: "problem.pain", pattern: /^(?:problem|pain(?: point)?)\s*[:\-]\s*(.+)$/i },
  { path: "problem.customerProfile", pattern: /^(?:target customer|customer|customer profile|icp)\s*[:\-]\s*(.+)$/i },
  { path: "problem.valueProposition", pattern: /^(?:value proposition|value prop)\s*[:\-]\s*(.+)$/i },
  { path: "problem.solution", pattern: /^solution\s*[:\-]\s*(.+)$/i },
  { path: "problem.tam", pattern: /^tam\s*[:\-]\s*(.+)$/i },
  { path: "problem.sam", pattern: /^sam\s*[:\-]\s*(.+)$/i },
  { path: "problem.som", pattern: /^som\s*[:\-]\s*(.+)$/i },
  { path: "gtm.cac", pattern: /^cac\s*[:\-]\s*(.+)$/i },
  { path: "gtm.ltv", pattern: /^ltv\s*[:\-]\s*(.+)$/i },
  { path: "gtm.channels", pattern: /^(?:channels?|distribution)\s*[:\-]\s*(.+)$/i },
  { path: "gtm.salesCycle", pattern: /^sales cycle\s*[:\-]\s*(.+)$/i },
  { path: "gtm.priceOrAcv", pattern: /^(?:acv|price|pricing)\s*[:\-]\s*(.+)$/i },
  { path: "gtm.customerType", pattern: /^customer type\s*[:\-]\s*(.+)$/i },
  { path: "traction.mrrOrGmv", pattern: /^(?:mrr|gmv|arr|revenue)\s*[:\-]\s*(.+)$/i },
  { path: "traction.momGrowth", pattern: /^(?:mom(?: growth)?|growth)\s*[:\-]\s*(.+)$/i },
  { path: "traction.activeUsers", pattern: /^(?:active users|users|customers? count)\s*[:\-]\s*(.+)$/i },
  { path: "traction.churn", pattern: /^churn\s*[:\-]\s*(.+)$/i },
  { path: "capTable.amountRaised", pattern: /^(?:raised|amount raised|total raised)\s*[:\-]\s*(.+)$/i },
  { path: "capTable.stage", pattern: /^stage\s*[:\-]\s*(.+)$/i },
  { path: "capTable.valuationOrCap", pattern: /^(?:valuation|cap|valuation or cap)\s*[:\-]\s*(.+)$/i },
  { path: "capTable.founderEquityPercent", pattern: /^founder equity\s*[:\-]\s*(.+)$/i },
  { path: "capTable.notableInvestors", pattern: /^investors?\s*[:\-]\s*(.+)$/i },
];

export interface PrefillResult {
  intake: Intake;
  sources: Record<string, FieldSource>;
  thin: boolean;
}

export function prefillFromText(text: string): PrefillResult {
  const intake = emptyIntake();
  const sources: Record<string, FieldSource> = {};
  const found = new Map<string, string>();

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    for (const rule of LINE_RULES) {
      if (found.has(rule.path)) continue;
      const match = line.match(rule.pattern);
      if (!match) continue;
      found.set(rule.path, clean(match[1]));
    }
  }

  applyFallbacks(text, found);

  for (const [path, value] of found) {
    if (!value) continue;
    writePath(intake, path, value);
    sources[path] = "deck";
  }

  return {
    intake,
    sources,
    thin: text.trim().length < THIN_TEXT,
  };
}

function applyFallbacks(text: string, found: Map<string, string>) {
  const grab = (path: string, pattern: RegExp) => {
    if (found.has(path)) return;
    const match = text.match(pattern);
    if (match?.[1]) found.set(path, clean(match[1]));
  };

  grab(
    "problem.tam",
    new RegExp(`TAM[^$£€\\n]{0,24}(${MONEY})`, "i"),
  );
  grab(
    "capTable.founderEquityPercent",
    /founder(?:s| team)? equity(?: split| ownership)?\s*(?:is|:)?\s*(\d+(?:\.\d+)?\s*%)/i,
  );

  // Real decks are slides, not "Label: value" lines. These read the common
  // slide phrasings so the form is not blank when the model cannot be reached.
  grab(
    "company.legalName",
    /\b((?:[A-Z][\w&'-]*[ \t]+){1,4}(?:Ltd|Limited|Inc|LLC|LLP|PLC|GmbH|Corp)\b\.?)/,
  );
  grab(
    "problem.tam",
    new RegExp(`(${MONEY})[^\\n]{0,30}\\b(?:market|category|opportunity)\\b`, "i"),
  );
  grab(
    "problem.tam",
    new RegExp(`\\b(?:market|category|opportunity)\\b[^\\n$£€]{0,40}(${MONEY})`, "i"),
  );
  grab(
    "gtm.priceOrAcv",
    /([$£€]\s?\d[\d.,]*\s?k?\s*(?:per|a|an|\/)\s*(?:student|pupil|user|seat|member|customer|household|month|year|school|site|licen[cs]e)(?:\s*(?:per|a|\/)\s*(?:month|year))?)/i,
  );
  grab(
    "capTable.valuationOrCap",
    new RegExp(`(${MONEY}\\s*(?:pre-money|post-money|valuation|cap)\\b)`, "i"),
  );
  grab("capTable.notableInvestors", /^Backed by\s+(.+)$/im);
  grab("capTable.stage", /\b(pre[-\s]?seed|series\s+a|seed)\b/i);

  const team = readTeam(text);
  if (team.length > 0) {
    if (!found.has("company.teamSize")) found.set("company.teamSize", String(team.length));
    if (!found.has("company.founderBackgrounds")) {
      found.set("company.founderBackgrounds", clean(team.join(" ")).slice(0, 600));
    }
  }
}

const MONEY = "[$£€]\\s?\\d[\\d.,]*\\s?(?:trillion|billion|million|thousand|bn|tn|mn|[tmbk])?\\b";

const ROLE_LINE =
  /^(?:(?:co-?)?founder|ceo|cto|coo|cfo|cpo|cmo|chief \w+ officer|managing director)\b[\w\s,&/-]{0,50}$/i;
const NAME_LINE = /^[A-Z][\w.'-]+(?:\s+[A-Z][\w.'-]+){1,3}$/;

/** Team slides list a name, then a role, then a line or two of background. */
function readTeam(text: string): string[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const roles: number[] = [];
  lines.forEach((line, index) => {
    if (index > 0 && ROLE_LINE.test(line) && NAME_LINE.test(lines[index - 1])) roles.push(index);
  });

  return roles.map((roleIndex, position) => {
    const next = roles[position + 1];
    const bio: string[] = [];
    // Background runs to the next person's name, or to the end of a sentence
    // for the last person on the slide.
    const stop = next ? next - 1 : Math.min(lines.length, roleIndex + 5);
    for (let index = roleIndex + 1; index < stop; index += 1) {
      if (!lines[index]) break;
      bio.push(lines[index]);
      if (!next && /[.!?]$/.test(lines[index])) break;
    }
    const about = bio.length > 0 ? `: ${bio.join(" ")}` : ".";
    return `${lines[roleIndex - 1]} (${lines[roleIndex]})${about}`;
  });
}

function writePath(intake: Intake, path: string, value: string) {
  const [pillar, key] = path.split(".") as [keyof Intake, string];
  const bucket = intake[pillar] as unknown as Record<string, string>;
  if (path === "gtm.customerType") {
    bucket[key] = normalizeCustomer(value);
    return;
  }
  if (path === "capTable.stage") {
    bucket[key] = normalizeStage(value);
    return;
  }
  bucket[key] = value;
}

function normalizeCustomer(value: string): CustomerType | "" {
  if (/enterprise/i.test(value)) return "b2b_enterprise";
  if (/smb|mid-?market|small business/i.test(value)) return "b2b_smb";
  if (/consumer|b2c/i.test(value)) return "consumer";
  if (value.trim()) return "other";
  return "";
}

function normalizeStage(value: string): Stage | "" {
  if (/pre[-\s]?seed/i.test(value)) return "pre_seed";
  if (/series\s*a/i.test(value)) return "series_a";
  if (/\bseed\b/i.test(value)) return "seed";
  if (value.trim()) return "other";
  return "";
}

function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export const SAMPLE_DECK_TEXT = `Northstar Labs
Legal name: Northstar Labs Inc.
Founded: March 2024
Headquarters: Austin, TX
Team size: 6
Founders: Ada Okonkwo, former payments lead at Stripe. Ben Cho, robotics PhD.
Problem: Mid-market warehouses lose 8 hours a week reconciling inventory.
Target customer: Enterprise warehouse operators
Solution: Software that reconciles scanner data overnight. SaaS subscription.
Value proposition: Overnight inventory truth without a new warehouse system.
TAM: $100M
SAM: $40M
SOM: $8M
Price: $50/month
Customer type: Enterprise B2B
CAC: $4000
LTV: $900
Channels: Outbound sales
Sales cycle: 90 days
MRR: $12000
MoM growth: 18%
Active users: 40
Churn: 2%
Raised: $1.5M
Stage: Seed
Valuation: $12M cap
Founder equity: 28%
Investors: Precursor, local angels
`;
