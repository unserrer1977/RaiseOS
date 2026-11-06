import { annualized, formatMoney, parseMoney, parsePercent } from "@/lib/money";
import type { FollowUp, Intake } from "@/lib/types";

const NARROW = /niche|narrow|single vertical|one city|local only/i;

export function selectFollowUps(intake: Intake): FollowUp[] {
  const questions: FollowUp[] = [];
  const tam = parseMoney(intake.problem.tam);
  const price = parseMoney(intake.gtm.priceOrAcv);
  const equity = parsePercent(intake.capTable.founderEquityPercent);
  const cac = parseMoney(intake.gtm.cac);
  const ltv = parseMoney(intake.gtm.ltv);
  const enterprise = isEnterprise(intake);
  const narrow =
    !tam &&
    (NARROW.test(intake.problem.customerProfile) ||
      (intake.problem.customerProfile.trim().length > 0 &&
        intake.problem.customerProfile.trim().length < 40 &&
        !intake.problem.tam.trim()));

  if ((tam && tam.amount < 1e9) || (!tam && narrow)) {
    questions.push({
      id: "market_scale",
      pillar: "problem",
      question: tam
        ? `Given the ${formatMoney(tam.amount)} TAM, how do you plan to achieve a venture-scale exit ($1B+ valuation), or are you planning to expand into adjacent markets?`
        : "The deck does not size the market, and the customer looks narrow. What is the TAM, and is there an adjacent market that supports a venture-scale exit?",
      reason: tam
        ? "Venture funds need a market that can support a $1B+ outcome."
        : "Market size is missing and the customer description is narrow.",
      answer: "",
    });
  }

  if (enterprise && price && isLowAcv(price)) {
    const shown = price.monthly
      ? `${formatMoney(price.amount)}/month`
      : `${formatMoney(price.amount)} ACV`;
    questions.push({
      id: "gtm_plg",
      pillar: "gtm",
      question: `Your price (${shown}) is low for an enterprise sales motion. Are you employing a product-led growth model to keep CAC near zero?`,
      reason: "Enterprise sales teams rarely pay back on a low ACV.",
      answer: "",
    });
  }

  if (
    equity !== null &&
    equity < 40 &&
    (intake.capTable.stage === "pre_seed" || intake.capTable.stage === "seed")
  ) {
    questions.push({
      id: "cap_table",
      pillar: "capTable",
      question: `The founding team equity (${trimPercent(equity)}%) is notably low for this stage. Was there an earlier spin-out, or is there a plan to refresh the option pool?`,
      reason: "Founders owning under 40% at seed often cannot take dilution from a new round.",
      answer: "",
    });
  }

  if (cac && ltv && cac.amount > ltv.amount) {
    questions.push({
      id: "unit_economics",
      pillar: "gtm",
      question: `CAC (${formatMoney(cac.amount)}) is higher than LTV (${formatMoney(ltv.amount)}). How do these unit economics reach a venture return, or which input is misstated?`,
      reason: "Paying more to acquire a customer than they are worth breaks the model.",
      answer: "",
    });
  } else if (!hasTraction(intake)) {
    questions.push({
      id: "traction_evidence",
      pillar: "traction",
      question:
        "The intake does not show revenue, users, or growth. What traction should an investor underwrite today?",
      reason: "No operating evidence is on the page yet.",
      answer: "",
    });
  }

  return questions.slice(0, 4);
}

export function isEnterprise(intake: Intake): boolean {
  if (intake.gtm.customerType === "b2b_enterprise") return true;
  return /enterprise/i.test(
    `${intake.gtm.customerType} ${intake.problem.customerProfile} ${intake.gtm.channels}`,
  );
}

export function isLowAcv(price: { amount: number; monthly: boolean }): boolean {
  if (price.monthly) return price.amount <= 100;
  return annualized(price) < 5000;
}

export function hasTraction(intake: Intake): boolean {
  return [
    intake.traction.mrrOrGmv,
    intake.traction.momGrowth,
    intake.traction.activeUsers,
    intake.traction.churn,
  ].some((value) => value.trim().length > 0);
}

export type BusinessModel = "software" | "heavy" | "unknown";

export function businessModel(intake: Intake): BusinessModel {
  const text = `${intake.problem.solution} ${intake.problem.valueProposition} ${intake.gtm.channels}`;
  const software = /saas|software|subscription|developer platform|\bapi\b/i.test(text);
  const heavy =
    /hardware|manufactur|physical good|agency|consulting|services firm|on-?site labor/i.test(
      text,
    );
  if (software) return "software";
  if (heavy) return "heavy";
  return "unknown";
}

function trimPercent(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}
