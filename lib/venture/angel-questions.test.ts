import { describe, expect, it } from "vitest";
import { coerceIntake, type FollowUp } from "@/lib/types";
import { buildFounderQuestions, formatFounderQuestions } from "@/lib/venture/angel-questions";

describe("buildFounderQuestions", () => {
  const COMPLETE = {
    company: { legalName: "Northstar", country: "United States", teamSize: "6", founderBackgrounds: "Ex-Stripe" },
    problem: {
      pain: "Warehouses lose hours reconciling stock.",
      customerProfile: "Warehouse operators",
      valueProposition: "Overnight inventory truth",
      solution: "Reconciliation software",
      tam: "$5B",
      sam: "$1B",
      som: "$100M",
    },
    gtm: {
      cac: "$1,000",
      ltv: "$10,000",
      channels: "PLG",
      salesCycle: "30 days",
      priceOrAcv: "$24k ACV",
      customerType: "b2b_smb",
    },
    traction: { mrrOrGmv: "$20k MRR", momGrowth: "15%", activeUsers: "40", churn: "2%" },
    capTable: {
      amountRaised: "$1.5M",
      stage: "seed",
      founderEquityPercent: "80%",
      valuationOrCap: "$10M cap",
      notableInvestors: "Precursor",
    },
  };

  it("asks about everything when the deck gave nothing", () => {
    const questions = buildFounderQuestions(coerceIntake({}), []);
    expect(new Set(questions).size).toBe(questions.length);
    expect(questions.length).toBeGreaterThan(20);
    expect(questions).toContain("Which country is the company registered and based in?");
    expect(questions).toContain("What is the company’s registered legal name?");
  });

  it("returns eight standard questions for a complete intake", () => {
    const questions = buildFounderQuestions(coerceIntake(COMPLETE), []);
    expect(questions).toHaveLength(8);
    expect(questions).not.toContain("Which country is the company registered and based in?");
  });

  it("adds a question for each thing the deck left out", () => {
    const intake = coerceIntake({
      ...COMPLETE,
      company: { ...COMPLETE.company, country: "", teamSize: "" },
      gtm: { ...COMPLETE.gtm, salesCycle: "" },
    });
    const questions = buildFounderQuestions(intake, []);
    expect(questions.slice(0, 3)).toEqual([
      "Which country is the company registered and based in?",
      "How many people work on this today, including the founders, and how many are full-time?",
      "How long does it take to win a customer, from first conversation to signed contract?",
    ]);
    expect(questions).toHaveLength(8);
  });

  it("puts unanswered follow-ups first and skips answered ones", () => {
    const followUps: FollowUp[] = [
      { id: "market_scale", pillar: "problem", question: "Market question?", reason: "", answer: "" },
      {
        id: "cap_table",
        pillar: "capTable",
        question: "Cap question?",
        reason: "",
        answer: "There was a spin-out from a university lab in 2022.",
      },
    ];
    const questions = buildFounderQuestions(coerceIntake({}), followUps);
    expect(questions[0]).toBe("Market question?");
    expect(questions).not.toContain("Cap question?");
  });

  it("flags worrying numbers", () => {
    const intake = coerceIntake({ gtm: { cac: "$5,000", ltv: "$6,000" }, traction: { churn: "9%" } });
    const questions = buildFounderQuestions(intake, []);
    expect(questions.some((question) => question.includes("less than three times CAC"))).toBe(true);
    expect(questions.some((question) => question.startsWith("Monthly churn is 9%"))).toBe(true);
  });
});

describe("formatFounderQuestions", () => {
  it("numbers the questions under a heading", () => {
    expect(formatFounderQuestions("Acme", ["A?", "B?"])).toBe("Questions for the founders of Acme\n\n1. A?\n2. B?");
  });
});
