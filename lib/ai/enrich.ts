import { generateText, Output } from "ai";
import { z } from "zod";
import { coerceIntake, type Intake, type Report } from "@/lib/types";

const MODEL = "google/gemini-3.5-flash-lite";

const intakeSchema = z.object({
  company: z.object({
    legalName: z.string(),
    foundingDate: z.string(),
    headquarters: z.string(),
    teamSize: z.string(),
    founderBackgrounds: z.string(),
  }),
  problem: z.object({
    pain: z.string(),
    customerProfile: z.string(),
    valueProposition: z.string(),
    solution: z.string(),
    tam: z.string(),
    sam: z.string(),
    som: z.string(),
  }),
  gtm: z.object({
    cac: z.string(),
    ltv: z.string(),
    channels: z.string(),
    salesCycle: z.string(),
    priceOrAcv: z.string(),
    customerType: z.enum(["", "b2b_enterprise", "b2b_smb", "consumer", "other"]),
  }),
  traction: z.object({
    mrrOrGmv: z.string(),
    momGrowth: z.string(),
    activeUsers: z.string(),
    churn: z.string(),
  }),
  capTable: z.object({
    amountRaised: z.string(),
    stage: z.enum(["", "pre_seed", "seed", "series_a", "other"]),
    valuationOrCap: z.string(),
    founderEquityPercent: z.string(),
    notableInvestors: z.string(),
  }),
});

export function modelConfigured(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY);
}

export async function enrichIntake(
  deckText: string,
  current: Intake,
): Promise<{ intake: Intake; filled: string[] } | null> {
  if (!modelConfigured() || deckText.trim().length < 80) return null;

  try {
    const { output } = await generateText({
      model: MODEL,
      timeout: 8000,
      output: Output.object({ schema: intakeSchema }),
      system:
        "Extract startup facts from a pitch deck. Use an empty string when the deck does not say. Do not invent metrics. customerType must be b2b_enterprise, b2b_smb, consumer, other, or empty. stage must be pre_seed, seed, series_a, other, or empty.",
      prompt: `Deck text:\n${deckText.slice(0, 12000)}\n\nAlready extracted:\n${JSON.stringify(current)}`,
    });
    if (!output) return null;
    const proposed = coerceIntake(output);
    const filled: string[] = [];
    const next = structuredClone(current);
    mergeBlanks(next, proposed, "", filled);
    return { intake: next, filled };
  } catch {
    return null;
  }
}

export async function enrichReportProse(
  report: Report,
  deckText: string,
): Promise<Report> {
  if (!modelConfigured()) return report;

  try {
    const { output } = await generateText({
      model: MODEL,
      timeout: 8000,
      output: Output.object({
        schema: z.object({
          rationale: z.string(),
          ventureScale: z.string(),
        }),
      }),
      system:
        "You phrase a venture assessment. The verdict is already decided. Do not change it, soften a red flag into a yes, or add metrics that are not in the notes.",
      prompt: `Verdict: ${report.verdictLabel}\nRules rationale: ${report.rationale}\nRules venture-scale note: ${report.ventureScale}\nGreen flags: ${report.greenFlags.join("; ")}\nRed flags: ${report.redFlags.join("; ")}\nDeck excerpt:\n${deckText.slice(0, 4000)}`,
    });
    if (!output?.rationale || !output.ventureScale) return report;
    return {
      ...report,
      rationale: output.rationale,
      ventureScale: output.ventureScale,
      narrativeSource: "model",
    };
  } catch {
    return report;
  }
}

function mergeBlanks(target: Intake, proposed: Intake, prefix: string, filled: string[]) {
  const left = target as unknown as Record<string, unknown>;
  const right = proposed as unknown as Record<string, unknown>;
  for (const key of Object.keys(left)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const current = left[key];
    const next = right[key];
    if (typeof current === "string" && typeof next === "string") {
      if (!current.trim() && next.trim()) {
        left[key] = next.trim();
        filled.push(path);
      }
      continue;
    }
    if (current && typeof current === "object" && next && typeof next === "object") {
      mergeBlanks(current as Intake, next as Intake, path, filled);
    }
  }
}
