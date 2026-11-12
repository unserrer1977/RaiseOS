import { formatMoney, parseMoney, parsePercent } from "@/lib/money";
import type { FollowUp, Intake } from "@/lib/types";

export type FounderQuestionItem = { gap: string; question: string };

interface Candidate {
  topic: string;
  gap: string;
  question: string;
}

const FOLLOW_UP_TOPIC: Record<FollowUp["id"], string> = {
  market_scale: "market",
  gtm_plg: "gtm",
  cap_table: "cap",
  unit_economics: "unit",
  traction_evidence: "traction",
};

/**
 * Founder questions from deck gaps and venture rule misses. Each item names the
 * gap explicitly; the angel is never asked to answer these.
 */
export function buildFounderQuestions(intake: Intake, followUps: FollowUp[]): FounderQuestionItem[] {
  const tailored: Candidate[] = [];

  for (const item of followUps) {
    tailored.push({
      topic: FOLLOW_UP_TOPIC[item.id],
      gap: item.reason.trim() || "Structural venture gap flagged from the deck",
      question: item.question,
    });
  }

  const { company, problem, gtm, traction, capTable } = intake;
  const tam = parseMoney(problem.tam);
  const cac = parseMoney(gtm.cac);
  const ltv = parseMoney(gtm.ltv);
  const churn = parsePercent(traction.churn);
  const growth = parsePercent(traction.momGrowth);
  const equity = parsePercent(capTable.founderEquityPercent);
  const raised = parseMoney(capTable.amountRaised);

  const missing = (value: string) => !value.trim();

  if (missing(company.legalName)) {
    tailored.push({
      topic: "legal-name",
      gap: "Legal name not stated in the deck",
      question: "What is the company’s registered legal name?",
    });
  }
  if (missing(company.country)) {
    tailored.push({
      topic: "country",
      gap: "Company country / jurisdiction not stated in the deck",
      question: "Which country is the company registered and based in?",
    });
  }
  if (missing(company.teamSize)) {
    tailored.push({
      topic: "team-size",
      gap: "Headcount not stated in the deck",
      question: "How many people work on this today, including the founders, and how many are full-time?",
    });
  }
  if (missing(problem.pain)) {
    tailored.push({
      topic: "pain",
      gap: "Customer problem not described in the deck",
      question: "What specific problem are you solving, and what does it cost your customers today?",
    });
  }
  if (missing(problem.customerProfile)) {
    tailored.push({
      topic: "customer",
      gap: "Target customer not stated in the deck",
      question: "Who exactly is your customer: who uses the product, and who pays for it?",
    });
  }
  if (missing(problem.valueProposition)) {
    tailored.push({
      topic: "value",
      gap: "Value proposition not stated in the deck",
      question: "Why would a customer switch to you from what they do today?",
    });
  }
  if (missing(problem.solution)) {
    tailored.push({
      topic: "solution",
      gap: "Product / solution not described in the deck",
      question: "What exactly is the product, and what does it do today compared with what is planned?",
    });
  }
  if (!tam) {
    tailored.push({
      topic: "market",
      gap: "TAM / market size not stated in the deck",
      question: "How big is the market you’re going after, and how did you size it from the bottom up?",
    });
  }
  if (missing(problem.sam) || missing(problem.som)) {
    tailored.push({
      topic: "market-reach",
      gap: "SAM or SOM not stated in the deck",
      question:
        "How much of that market can you realistically reach, and how much do you expect to win in the next few years?",
    });
  }
  if (missing(gtm.customerType)) {
    tailored.push({
      topic: "customer-type",
      gap: "Customer type (B2B / consumer) not stated in the deck",
      question: "Do you sell to large enterprises, smaller businesses or consumers?",
    });
  }
  if (missing(gtm.priceOrAcv)) {
    tailored.push({
      topic: "price",
      gap: "Pricing or ACV not stated in the deck",
      question: "What does a customer pay, and what is a typical contract worth per year?",
    });
  }
  if (missing(gtm.salesCycle)) {
    tailored.push({
      topic: "sales-cycle",
      gap: "Sales cycle not stated in the deck",
      question: "How long does it take to win a customer, from first conversation to signed contract?",
    });
  }
  if (!cac || !ltv) {
    tailored.push({
      topic: "unit",
      gap: "CAC or LTV not stated in the deck",
      question: "What does it cost you to win a customer, and how much is a customer worth over their lifetime?",
    });
  } else if (ltv.amount < cac.amount * 3) {
    tailored.push({
      topic: "unit",
      gap: `Unit economics in the deck look weak (LTV ${formatMoney(ltv.amount, ltv.currency)} vs CAC ${formatMoney(cac.amount, cac.currency)})`,
      question: `LTV (${formatMoney(ltv.amount, ltv.currency)}) is less than three times CAC (${formatMoney(cac.amount, cac.currency)}). What will improve that ratio, and by when?`,
    });
  }
  if (!traction.mrrOrGmv.trim()) {
    tailored.push({
      topic: "traction",
      gap: "Revenue or GMV not stated in the deck",
      question: "What revenue or paying usage do you have today, and can you share the monthly numbers?",
    });
  }
  if (growth === null) {
    tailored.push({
      topic: "growth",
      gap: "Growth rate not stated in the deck",
      question: "What has month-on-month growth looked like over the last six months?",
    });
  }
  if (missing(traction.activeUsers)) {
    tailored.push({
      topic: "users",
      gap: "Active users / customers not stated in the deck",
      question: "How many active users or paying customers do you have today?",
    });
  }
  if (churn === null) {
    tailored.push({
      topic: "churn",
      gap: "Churn not stated in the deck",
      question: "How many customers stay after the first few months, and why do the ones who leave go?",
    });
  } else if (churn >= 5) {
    tailored.push({
      topic: "churn",
      gap: `Churn of ${churn}% stated in the deck is high for venture scale`,
      question: `Monthly churn is ${churn}%. What is driving it, and what are you doing to bring it down?`,
    });
  }
  if (!gtm.channels.trim()) {
    tailored.push({
      topic: "channels",
      gap: "Go-to-market channels not stated in the deck",
      question: "Where did your last ten customers come from, and which channel will you scale?",
    });
  }
  if (equity === null) {
    tailored.push({
      topic: "cap",
      gap: "Founder equity not stated in the deck",
      question: "Can you walk me through the cap table: what do the founders own, and how big is the option pool?",
    });
  }
  if (!capTable.valuationOrCap.trim()) {
    tailored.push({
      topic: "terms",
      gap: "Round terms (valuation / cap) not stated in the deck",
      question: "What are the terms of this round: instrument, valuation or cap, discount, and how much is already committed?",
    });
  }
  if (!company.founderBackgrounds.trim()) {
    tailored.push({
      topic: "team",
      gap: "Founder backgrounds not stated in the deck",
      question: "Why are you the right team to build this, and what have you built or sold before?",
    });
  }
  if (missing(capTable.stage)) {
    tailored.push({
      topic: "stage",
      gap: "Fundraising stage not stated in the deck",
      question: "What stage is this round: pre-seed, seed or Series A?",
    });
  }
  if (!raised) {
    tailored.push({
      topic: "investors",
      gap: "Amount raised to date not stated in the deck",
      question: "How much has the company raised to date, and from whom?",
    });
  } else if (missing(capTable.notableInvestors)) {
    tailored.push({
      topic: "investors",
      gap: "Existing investors not named in the deck",
      question: "Who has invested so far, and can I speak to one of them?",
    });
  }

  const seen = new Set<string>();
  const result: FounderQuestionItem[] = [];
  for (const candidate of tailored) {
    if (seen.has(candidate.topic)) continue;
    seen.add(candidate.topic);
    result.push({ gap: candidate.gap, question: candidate.question });
  }
  return result;
}

/** Plain-text version for the clipboard. */
export function formatFounderQuestions(companyName: string, questions: FounderQuestionItem[]): string {
  const heading = `Questions for the founders of ${companyName}`;
  const lines = questions.flatMap((item, index) => [
    `${index + 1}. Gap: ${item.gap}`,
    `   ${item.question}`,
  ]);
  return [heading, "", ...lines].join("\n");
}
