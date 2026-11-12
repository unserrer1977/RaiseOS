import { formatMoney, parseMoney, parsePercent } from "@/lib/money";
import type { FollowUp, Intake, Report, Verdict } from "@/lib/types";
import {
  businessModel,
  hasTraction,
  isEnterprise,
  isLowAcv,
} from "@/lib/venture/rules";

type Miss = "market" | "gtm" | "cap" | "unit" | "margins" | "traction";

const VERDICT_LABEL: Record<Verdict, string> = {
  highly_fundable: "Highly Fundable",
  borderline: "Borderline/Niche",
  bootstrap: "Bootstrapping Recommended",
};

export function buildReport(intake: Intake, followUps: FollowUp[]): Report {
  const marketAnswer =
    followUps.find((item) => item.id === "market_scale")?.answer.trim() ?? "";
  const tractionAnswer =
    followUps.find((item) => item.id === "traction_evidence")?.answer.trim() ?? "";
  const misses = remainingMisses(intake, followUps);
  const model = businessModel(intake);
  const tam = parseMoney(intake.problem.tam);
  const tractionOk = hasTraction(intake) || tractionAnswer.length >= 20;
  const marketOk = (tam !== null && tam.amount >= 1e9) || mitigatesMarket(marketAnswer);
  const verdict = chooseVerdict(misses, marketOk, tractionOk);

  const greenFlags = greenFlagList(intake, model);
  const redFlags = misses.map((miss) => redFlagCopy(miss, intake));
  const companyName = intake.company.legalName.trim() || "This company";

  return {
    verdict,
    verdictLabel: VERDICT_LABEL[verdict],
    companyName,
    rationale: rationaleCopy(verdict, companyName, misses, intake),
    ventureScale: ventureScaleCopy(model, tam?.amount ?? null, intake),
    greenFlags: greenFlags.length > 0 ? greenFlags : ["No standout green flag is on the page yet."],
    redFlags: redFlags.length > 0 ? redFlags : ["No structural red flag fired from the intake."],
    swot: swotCopy(intake, misses, model, followUps),
    narrativeSource: "rules",
  };
}

function chooseVerdict(misses: Miss[], marketOk: boolean, tractionOk: boolean): Verdict {
  if (misses.length >= 2) return "bootstrap";
  if (misses.length === 1) return "borderline";
  if (marketOk && tractionOk) return "highly_fundable";
  return "borderline";
}

function remainingMisses(intake: Intake, followUps: FollowUp[]): Miss[] {
  const misses: Miss[] = [];
  const answer = (id: FollowUp["id"]) =>
    followUps.find((item) => item.id === id)?.answer.trim() ?? "";

  const tam = parseMoney(intake.problem.tam);
  if (tam && tam.amount < 1e9 && !mitigatesMarket(answer("market_scale"))) {
    misses.push("market");
  } else if (!tam && !mitigatesMarket(answer("market_scale"))) {
    misses.push("market");
  }

  const price = parseMoney(intake.gtm.priceOrAcv);
  if (
    isEnterprise(intake) &&
    price &&
    isLowAcv(price) &&
    !mitigatesGtm(answer("gtm_plg"))
  ) {
    misses.push("gtm");
  }

  const equity = parsePercent(intake.capTable.founderEquityPercent);
  if (
    equity !== null &&
    equity < 40 &&
    (intake.capTable.stage === "pre_seed" || intake.capTable.stage === "seed") &&
    !mitigatesCap(answer("cap_table"))
  ) {
    misses.push("cap");
  }

  const cac = parseMoney(intake.gtm.cac);
  const ltv = parseMoney(intake.gtm.ltv);
  if (cac && ltv && cac.amount > ltv.amount && !mitigatesUnit(answer("unit_economics"))) {
    misses.push("unit");
  }

  if (businessModel(intake) === "heavy") misses.push("margins");
  if (!hasTraction(intake) && answer("traction_evidence").length < 20) {
    misses.push("traction");
  }

  return misses;
}

function mitigatesMarket(answer: string): boolean {
  return /adjacent|expand|\$?\s*\d+(\.\d+)?\s*(b\b|billion)/i.test(answer);
}

function mitigatesGtm(answer: string): boolean {
  return /product-led|\bplg\b|self-serve|freemium|no sales team/i.test(answer);
}

function mitigatesCap(answer: string): boolean {
  return /option pool|refresh|spin-?out/i.test(answer);
}

function mitigatesUnit(answer: string): boolean {
  return /raise price|usage-based|ltv (now|will)|gross margin above/i.test(answer);
}

function greenFlagList(intake: Intake, model: ReturnType<typeof businessModel>): string[] {
  const flags: string[] = [];
  const tam = parseMoney(intake.problem.tam);
  const growth = parsePercent(intake.traction.momGrowth);
  const equity = parsePercent(intake.capTable.founderEquityPercent);
  const cac = parseMoney(intake.gtm.cac);
  const ltv = parseMoney(intake.gtm.ltv);

  if (tam && tam.amount >= 1e9) flags.push(`TAM of ${formatMoney(tam.amount)} can support a venture outcome.`);
  if (growth !== null && growth >= 10) flags.push(`MoM growth of ${growth}% is strong for this stage.`);
  if (equity !== null && equity >= 50) flags.push(`Founders still own ${equity}%, enough room for a new round.`);
  if (cac && ltv && ltv.amount >= cac.amount * 3) {
    flags.push("LTV is at least 3× CAC.");
  }
  if (model === "software") flags.push("The product reads as software, which can carry venture margins.");
  if (intake.traction.mrrOrGmv.trim()) {
    flags.push(`Traction is stated: ${intake.traction.mrrOrGmv.trim()}.`);
  }
  return flags;
}

function redFlagCopy(miss: Miss, intake: Intake): string {
  const tam = parseMoney(intake.problem.tam);
  const equity = parsePercent(intake.capTable.founderEquityPercent);
  switch (miss) {
    case "market":
      return tam
        ? `TAM of ${formatMoney(tam.amount)} is below the $1B venture bar, and the follow-up did not describe a larger market.`
        : "Market size is still unknown.";
    case "gtm":
      return "Enterprise motion paired with a low price, without a product-led distribution answer.";
    case "cap":
      return `Founders own ${equity ?? "under 40"}% at ${intake.capTable.stage === "pre_seed" ? "pre-seed" : "seed"}, with no pool refresh or spin-out described.`;
    case "unit":
      return "CAC is higher than LTV, and the follow-up did not repair the ratio.";
    case "margins":
      return "The business reads as hardware or services, which ties up capital a software round does not.";
    case "traction":
      return "No revenue, usage, or growth figure is available to underwrite.";
  }
}

function rationaleCopy(
  verdict: Verdict,
  companyName: string,
  misses: Miss[],
  intake: Intake,
): string {
  const stage = intake.capTable.stage ? ` at ${intake.capTable.stage.replace("_", "-")}` : "";
  if (verdict === "highly_fundable") {
    return `${companyName} fits a venture profile${stage}: the market, ownership, and distribution signals that fired are compatible with a fund-sized outcome, and there is operating evidence on the page.`;
  }
  if (verdict === "borderline") {
    return `${companyName} is fundable only in a narrow sense${stage}. ${misses.length === 0 ? "A required venture input is still missing, so this is not a clean yes." : `One structural gap remains (${labelMiss(misses[0])}).`}`;
  }
  return `${companyName} stacks ${misses.length} structural gaps (${misses.map(labelMiss).join(", ")}). A seed fund is the wrong instrument until those are repaired. Bootstrapping, or a smaller non-venture round, fits the shape of the business today.`;
}

function ventureScaleCopy(model: ReturnType<typeof businessModel>, tam: number | null, intake: Intake): string {
  const market = tam ? `The stated TAM is ${formatMoney(tam)}.` : "TAM was not stated.";
  if (model === "software") {
    return `${market} Software margins can turn a large market into a venture-scale company if distribution stays cheaper than the revenue it produces. Price on file: ${intake.gtm.priceOrAcv || "not stated"}.`;
  }
  if (model === "heavy") {
    return `${market} Hardware or services businesses consume capital before they compound. That profile usually misses a classic venture return unless the software layer, not the labor or inventory, is what grows.`;
  }
  return `${market} The deck does not say whether this is software, hardware, or services, so margin structure is still an open question.`;
}

function swotCopy(
  intake: Intake,
  misses: Miss[],
  model: ReturnType<typeof businessModel>,
  followUps: FollowUp[],
) {
  const strengths: string[] = [];
  const growth = parsePercent(intake.traction.momGrowth);
  if (growth !== null && growth >= 10) strengths.push(`Strong MoM growth (${growth}%).`);
  if (model === "software") strengths.push("Software delivery rather than a capital-intensive product.");
  if (intake.company.founderBackgrounds.trim()) {
    strengths.push("Founder background is on the record.");
  }
  if (strengths.length === 0) strengths.push("The team completed a full intake an investor can underwrite.");

  const weaknesses = misses.map((miss) => redFlagCopy(miss, intake));
  if (weaknesses.length === 0) weaknesses.push("No structural weakness fired from the current answers.");

  const opportunities = followUps
    .filter((item) => item.answer.trim())
    .map((item) => `Founder answer on ${item.id.replaceAll("_", " ")}: ${item.answer.trim()}`);
  if (opportunities.length === 0) {
    opportunities.push("No follow-up opened a new market or motion beyond the original deck.");
  }

  const threats: string[] = [];
  const churn = parsePercent(intake.traction.churn);
  if (churn !== null && churn >= 5) threats.push(`Churn of ${churn}% will erode the growth story.`);
  if (misses.includes("market")) threats.push("A small or unknown market caps the exit even if execution is excellent.");
  if (misses.includes("unit")) threats.push("Negative unit economics get worse as paid acquisition scales.");
  if (threats.length === 0) threats.push("No explicit threat figure (churn, concentration) was provided.");

  return { strengths, weaknesses, opportunities, threats };
}

function labelMiss(miss: Miss): string {
  switch (miss) {
    case "market":
      return "market size";
    case "gtm":
      return "go-to-market";
    case "cap":
      return "cap table";
    case "unit":
      return "unit economics";
    case "margins":
      return "margin structure";
    case "traction":
      return "traction";
  }
}
