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

  it("labels gaps when the deck gave nothing", () => {
    const questions = buildFounderQuestions(coerceIntake({}), []);
    expect(questions.length).toBeGreaterThan(5);
    expect(questions[0].gap).toBeTruthy();
    expect(questions.some((q) => q.gap.includes("country"))).toBe(true);
  });

  it("returns only rule gaps for a complete intake", () => {
    const questions = buildFounderQuestions(coerceIntake(COMPLETE), []);
    expect(questions).toHaveLength(0);
  });

  it("adds a labelled gap for each thing the deck left out", () => {
    const intake = coerceIntake({
      ...COMPLETE,
      company: { ...COMPLETE.company, country: "", teamSize: "" },
      gtm: { ...COMPLETE.gtm, salesCycle: "" },
    });
    const questions = buildFounderQuestions(intake, []);
    expect(questions[0]).toMatchObject({
      gap: "Company country / jurisdiction not stated in the deck",
    });
    expect(questions.some((q) => q.gap.includes("Headcount"))).toBe(true);
    expect(questions.some((q) => q.gap.includes("Sales cycle"))).toBe(true);
  });

  it("includes structural follow-ups as founder questions with rule gaps", () => {
    const followUps: FollowUp[] = [
      {
        id: "market_scale",
        pillar: "problem",
        question: "Market question?",
        reason: "Venture funds need a market that can support a $1B+ outcome.",
        answer: "",
      },
    ];
    const questions = buildFounderQuestions(coerceIntake({}), followUps);
    expect(questions[0]).toEqual({
      gap: "Venture funds need a market that can support a $1B+ outcome.",
      question: "Market question?",
    });
  });

  it("flags worrying numbers in the gap line", () => {
    const intake = coerceIntake({ gtm: { cac: "$5,000", ltv: "$6,000" }, traction: { churn: "9%" } });
    const questions = buildFounderQuestions(intake, []);
    expect(questions.some((q) => q.gap.includes("Unit economics"))).toBe(true);
    expect(questions.some((q) => q.gap.startsWith("Churn of"))).toBe(true);
  });
});

describe("formatFounderQuestions", () => {
  it("numbers gaps and questions under a heading", () => {
    const text = formatFounderQuestions("Acme", [
      { gap: "TAM missing", question: "What is TAM?" },
      { gap: "No traction", question: "Any revenue?" },
    ]);
    expect(text).toContain("1. Gap: TAM missing");
    expect(text).toContain("What is TAM?");
    expect(text).toContain("2. Gap: No traction");
  });
});
