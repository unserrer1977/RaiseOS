import { describe, expect, it } from "vitest";
import { coerceIntake, type FollowUp } from "@/lib/types";
import { buildFounderQuestions, formatFounderQuestions } from "@/lib/venture/angel-questions";

describe("buildFounderQuestions", () => {
  it("always returns ten distinct questions for an empty intake", () => {
    const questions = buildFounderQuestions(coerceIntake({}), []);
    expect(questions).toHaveLength(10);
    expect(new Set(questions).size).toBe(10);
  });

  it("returns ten questions for a complete intake", () => {
    const intake = coerceIntake({
      company: { legalName: "Northstar", founderBackgrounds: "Ex-Stripe" },
      problem: { tam: "$5B" },
      gtm: { cac: "$1,000", ltv: "$10,000", channels: "PLG" },
      traction: { mrrOrGmv: "$20k MRR", momGrowth: "15%", churn: "2%" },
      capTable: { founderEquityPercent: "80%", valuationOrCap: "$10M cap" },
    });
    expect(buildFounderQuestions(intake, [])).toHaveLength(10);
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
