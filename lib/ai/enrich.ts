import { generateText, Output } from "ai";
import { z } from "zod";
import { isSlideLabelledDeckText } from "@/lib/extract/deck-read";
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

const EXTRACT_SYSTEM = [
  "You extract startup facts from a pitch deck for an investor intake form.",
  "Decks are written as slides: headings, short phrases, charts and callouts. When the input uses \"Slide N:\" lines, treat each block as one slide. Read them the way an investor would; only use an attached PDF when no slide text was provided.",
  "Only use what the deck states. Use an empty string when the deck does not say. Never guess or invent a metric.",
  "Keep amounts as the deck writes them, with the currency symbol and unit, for example \"£690M\" or \"$3.1k MRR\".",
  "teamSize is the number of people working at the company, as digits. Do not use survey sizes, customer counts or market numbers. If the deck only shows named team members, count them.",
  "foundingDate is when the company was founded, not the date of the deck.",
  "amountRaised is money already raised or committed, not the size of the round being asked for.",
  "valuationOrCap is the valuation or cap of the current round.",
  "priceOrAcv is what a customer pays. mrrOrGmv is current revenue or GMV. activeUsers is current users or customers; say so if the number is a waitlist.",
  "customerType must be b2b_enterprise, b2b_smb, consumer, other, or empty. stage must be pre_seed, seed, series_a, other, or empty.",
  "Keep each answer short: a phrase or one or two sentences.",
].join(" ");

/** PDFs above this are sent as text only. */
const MAX_MODEL_PDF_BYTES = 15 * 1024 * 1024;
const MIN_TEXT = 80;

/**
 * Reads the deck with the model. The model's answers replace anything the
 * rules prefilled, but never a field in `locked` (ones the person typed).
 */
export async function enrichIntake(
  deckText: string,
  current: Intake,
  options: { pdf?: Uint8Array | null; locked?: ReadonlySet<string> } = {},
): Promise<{ intake: Intake; filled: string[] } | null> {
  if (!modelConfigured()) return null;
  const text = deckText.trim().slice(0, 60000);
  const slideLabelled = isSlideLabelledDeckText(text);
  const pdf =
    !slideLabelled &&
    options.pdf &&
    options.pdf.length > 0 &&
    options.pdf.length <= MAX_MODEL_PDF_BYTES
      ? options.pdf
      : null;
  const hasText = text.length >= MIN_TEXT;
  if (!pdf && !hasText) return null;

  let proposed: Intake | null = null;
  if (pdf) proposed = await extractWithModel(text, pdf);
  if (!proposed && hasText) proposed = await extractWithModel(text, null);
  if (!proposed) return null;

  const filled: string[] = [];
  const next = structuredClone(current);
  mergeProposed(next, proposed, "", filled, options.locked ?? new Set());
  return { intake: next, filled };
}

async function extractWithModel(text: string, pdf: Uint8Array | null): Promise<Intake | null> {
  const textBlock = text
    ? `Text pulled from the deck (may be incomplete):\n${text}`
    : "No text could be pulled from the deck. Read the attached file.";
  try {
    const { output } = await generateText({
      model: MODEL,
      timeout: pdf ? 90000 : 45000,
      output: Output.object({ schema: intakeSchema }),
      system: EXTRACT_SYSTEM,
      messages: [
        {
          role: "user",
          content: pdf
            ? [
                { type: "text", text: `The pitch deck is attached as a PDF.\n\n${textBlock}` },
                { type: "file", mediaType: "application/pdf", data: pdf },
              ]
            : [{ type: "text", text: textBlock }],
        },
      ],
    });
    if (!output) {
      console.error(`enrichIntake: model returned nothing (${pdf ? "pdf" : "text"} mode)`);
      return null;
    }
    return coerceIntake(output);
  } catch (error) {
    console.error(`enrichIntake: model call failed (${pdf ? "pdf" : "text"} mode)`, error);
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
      timeout: 30000,
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
  } catch (error) {
    console.error("enrichReportProse: model call failed", error);
    return report;
  }
}

function mergeProposed(
  target: Intake,
  proposed: Intake,
  prefix: string,
  filled: string[],
  locked: ReadonlySet<string>,
) {
  const left = target as unknown as Record<string, unknown>;
  const right = proposed as unknown as Record<string, unknown>;
  for (const key of Object.keys(left)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const current = left[key];
    const next = right[key];
    if (typeof current === "string" && typeof next === "string") {
      const value = next.trim();
      if (value && value !== current.trim() && !locked.has(path)) {
        left[key] = value;
        filled.push(path);
      }
      continue;
    }
    if (current && typeof current === "object" && next && typeof next === "object") {
      mergeProposed(current as Intake, next as Intake, path, filled, locked);
    }
  }
}
