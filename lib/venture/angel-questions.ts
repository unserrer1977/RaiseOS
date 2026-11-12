import { formatMoney, parseMoney, parsePercent } from "@/lib/money";
import type { FollowUp, Intake } from "@/lib/types";

/** The list is never shorter than this; missing information can make it longer. */
export const FOUNDER_QUESTION_COUNT = 10;

interface Candidate {
  topic: string;
  question: string;
}

/**
 * Questions an angel can put to the founders. Questions tailored to this deck
 * come first: follow-ups left unanswered, then one for every piece of
 * information the deck did not give, then worrying numbers. Standard angel
 * diligence questions make the list up to ten when it would be shorter.
 */
export function buildFounderQuestions(intake: Intake, followUps: FollowUp[]): string[] {
  const tailored: Candidate[] = [];

  // 1. Follow-ups the angel could not answer stay open for the founder.
  const FOLLOW_UP_TOPIC: Record<FollowUp["id"], string> = {
    market_scale: "market",
    gtm_plg: "gtm",
    cap_table: "cap",
    unit_economics: "unit",
    traction_evidence: "traction",
  };
  for (const item of followUps) {
    if (item.answer.trim().length < 20) {
      tailored.push({ topic: FOLLOW_UP_TOPIC[item.id], question: item.question });
    }
  }

  // 2. Gaps and warning signs in the intake.
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
    tailored.push({ topic: "legal-name", question: "What is the company’s registered legal name?" });
  }
  if (missing(company.country)) {
    tailored.push({ topic: "country", question: "Which country is the company registered and based in?" });
  }
  if (missing(company.teamSize)) {
    tailored.push({
      topic: "team-size",
      question: "How many people work on this today, including the founders, and how many are full-time?",
    });
  }
  if (missing(problem.pain)) {
    tailored.push({
      topic: "pain",
      question: "What specific problem are you solving, and what does it cost your customers today?",
    });
  }
  if (missing(problem.customerProfile)) {
    tailored.push({
      topic: "customer",
      question: "Who exactly is your customer: who uses the product, and who pays for it?",
    });
  }
  if (missing(problem.valueProposition)) {
    tailored.push({
      topic: "value",
      question: "Why would a customer switch to you from what they do today?",
    });
  }
  if (missing(problem.solution)) {
    tailored.push({
      topic: "solution",
      question: "What exactly is the product, and what does it do today compared with what is planned?",
    });
  }
  if (!tam) {
    tailored.push({
      topic: "market",
      question: "How big is the market you’re going after, and how did you size it from the bottom up?",
    });
  }
  if (missing(problem.sam) || missing(problem.som)) {
    tailored.push({
      topic: "market-reach",
      question: "How much of that market can you realistically reach, and how much do you expect to win in the next few years?",
    });
  }
  if (missing(gtm.customerType)) {
    tailored.push({
      topic: "customer-type",
      question: "Do you sell to large enterprises, smaller businesses or consumers?",
    });
  }
  if (missing(gtm.priceOrAcv)) {
    tailored.push({
      topic: "price",
      question: "What does a customer pay, and what is a typical contract worth per year?",
    });
  }
  if (missing(gtm.salesCycle)) {
    tailored.push({
      topic: "sales-cycle",
      question: "How long does it take to win a customer, from first conversation to signed contract?",
    });
  }
  if (!cac || !ltv) {
    tailored.push({
      topic: "unit",
      question: "What does it cost you to win a customer, and how much is a customer worth over their lifetime?",
    });
  } else if (ltv.amount < cac.amount * 3) {
    tailored.push({
      topic: "unit",
      question: `LTV (${formatMoney(ltv.amount, ltv.currency)}) is less than three times CAC (${formatMoney(cac.amount, cac.currency)}). What will improve that ratio, and by when?`,
    });
  }
  if (!traction.mrrOrGmv.trim()) {
    tailored.push({
      topic: "traction",
      question: "What revenue or paying usage do you have today, and can you share the monthly numbers?",
    });
  }
  if (growth === null) {
    tailored.push({
      topic: "growth",
      question: "What has month-on-month growth looked like over the last six months?",
    });
  }
  if (missing(traction.activeUsers)) {
    tailored.push({
      topic: "users",
      question: "How many active users or paying customers do you have today?",
    });
  }
  if (churn === null) {
    tailored.push({
      topic: "churn",
      question: "How many customers stay after the first few months, and why do the ones who leave go?",
    });
  } else if (churn >= 5) {
    tailored.push({
      topic: "churn",
      question: `Monthly churn is ${churn}%. What is driving it, and what are you doing to bring it down?`,
    });
  }
  if (!gtm.channels.trim()) {
    tailored.push({
      topic: "channels",
      question: "Where did your last ten customers come from, and which channel will you scale?",
    });
  }
  if (equity === null) {
    tailored.push({
      topic: "cap",
      question: "Can you walk me through the cap table: what do the founders own, and how big is the option pool?",
    });
  }
  if (!capTable.valuationOrCap.trim()) {
    tailored.push({
      topic: "terms",
      question: "What are the terms of this round: instrument, valuation or cap, discount, and how much is already committed?",
    });
  }
  if (!company.founderBackgrounds.trim()) {
    tailored.push({
      topic: "team",
      question: "Why are you the right team to build this, and what have you built or sold before?",
    });
  }
  if (missing(capTable.stage)) {
    tailored.push({ topic: "stage", question: "What stage is this round: pre-seed, seed or Series A?" });
  }
  if (!raised) {
    tailored.push({
      topic: "investors",
      question: "How much has the company raised to date, and from whom?",
    });
  } else if (missing(capTable.notableInvestors)) {
    tailored.push({
      topic: "investors",
      question: "Who has invested so far, and can I speak to one of them?",
    });
  }

  // 3. Standard angel diligence, used to make up the ten.
  const standard: Candidate[] = [
    { topic: "terms", question: "What are the terms of this round, and how much is already committed?" },
    { topic: "funds", question: "How will you spend this money, and what milestones will it get you to before the next raise?" },
    { topic: "runway", question: "How many months of runway will you have after this round, at your planned burn?" },
    { topic: "competition", question: "Who else is solving this problem, and why will customers choose you over them?" },
    { topic: "why-now", question: "Why is now the right time for this business, and what has changed to make it possible?" },
    { topic: "customers", question: "Can I speak to two or three of your customers?" },
    { topic: "risk", question: "What is the single biggest risk to this business, and how are you addressing it?" },
    { topic: "commitment", question: "Is everyone on the founding team full-time, and how is founder equity vesting?" },
    { topic: "exit", question: "Who could acquire this company one day, or what does a large outcome look like?" },
    { topic: "angel-help", question: "Beyond the cheque, what would you most like help with from your angel investors?" },
    { topic: "reporting", question: "How will you keep investors updated after the round closes?" },
  ];

  const seen = new Set<string>();
  const result: string[] = [];
  // Every tailored question is kept: anything the deck did not say has to be
  // asked. Standard questions only top the list up to the minimum.
  for (const candidate of tailored) {
    if (seen.has(candidate.topic)) continue;
    seen.add(candidate.topic);
    result.push(candidate.question);
  }
  for (const candidate of standard) {
    if (result.length >= FOUNDER_QUESTION_COUNT) break;
    if (seen.has(candidate.topic)) continue;
    seen.add(candidate.topic);
    result.push(candidate.question);
  }
  return result;
}

/** Plain-text version for the clipboard. */
export function formatFounderQuestions(companyName: string, questions: string[]): string {
  const heading = `Questions for the founders of ${companyName}`;
  return [heading, "", ...questions.map((question, index) => `${index + 1}. ${question}`)].join("\n");
}
