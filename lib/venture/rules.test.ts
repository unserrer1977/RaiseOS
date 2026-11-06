import { describe, expect, it } from "vitest";
import { emptyIntake, type Intake } from "@/lib/types";
import { buildReport } from "@/lib/venture/report";
import { selectFollowUps } from "@/lib/venture/rules";

function intake(patch: (value: Intake) => void): Intake {
  const value = emptyIntake();
  patch(value);
  return value;
}

const healthy = () =>
  intake((value) => {
    value.problem.tam = "$2B";
    value.problem.solution = "SaaS subscription for finance teams";
    value.gtm.customerType = "b2b_enterprise";
    value.gtm.priceOrAcv = "$40,000 ACV";
    value.gtm.cac = "$5,000";
    value.gtm.ltv = "$40,000";
    value.traction.mrrOrGmv = "$50,000";
    value.traction.momGrowth = "20%";
    value.capTable.stage = "seed";
    value.capTable.founderEquityPercent = "70%";
  });

describe("selectFollowUps", () => {
  it("asks about a sub-billion TAM, low enterprise ACV, thin founder ownership, and broken unit economics", () => {
    const value = intake((draft) => {
      draft.problem.tam = "$100M";
      draft.problem.solution = "SaaS";
      draft.gtm.customerType = "b2b_enterprise";
      draft.gtm.priceOrAcv = "$50/month";
      draft.gtm.cac = "$4000";
      draft.gtm.ltv = "$900";
      draft.traction.mrrOrGmv = "$12000";
      draft.capTable.stage = "seed";
      draft.capTable.founderEquityPercent = "28%";
    });
    const questions = selectFollowUps(value);
    expect(questions.map((item) => item.id)).toEqual([
      "market_scale",
      "gtm_plg",
      "cap_table",
      "unit_economics",
    ]);
    expect(questions[0]?.question).toContain("$100M");
    expect(questions[1]?.question).toContain("product-led");
    expect(questions[2]?.question).toContain("28%");
  });

  it("does not treat series A ownership or an SMB price as those triggers", () => {
    const value = healthy();
    value.problem.tam = "$2B";
    value.capTable.stage = "series_a";
    value.capTable.founderEquityPercent = "20%";
    value.gtm.customerType = "b2b_smb";
    value.gtm.priceOrAcv = "$50/month";
    expect(selectFollowUps(value).map((item) => item.id)).toEqual([]);
  });

  it("asks for traction when no operating numbers are present", () => {
    const value = healthy();
    value.traction.mrrOrGmv = "";
    value.traction.momGrowth = "";
    expect(selectFollowUps(value).map((item) => item.id)).toEqual(["traction_evidence"]);
  });

  it("asks about a missing TAM when the customer is narrow", () => {
    const value = healthy();
    value.problem.tam = "";
    value.problem.customerProfile = "One city bakeries";
    expect(selectFollowUps(value).some((item) => item.id === "market_scale")).toBe(true);
  });
});

describe("buildReport", () => {
  it("marks a clean software company highly fundable", () => {
    const report = buildReport(healthy(), []);
    expect(report.verdict).toBe("highly_fundable");
    expect(report.verdictLabel).toBe("Highly Fundable");
    expect(report.narrativeSource).toBe("rules");
  });

  it("marks a single market gap as borderline", () => {
    const value = healthy();
    value.problem.tam = "$100M";
    const report = buildReport(value, []);
    expect(report.verdict).toBe("borderline");
  });

  it("recommends bootstrapping when several structural gaps stack", () => {
    const value = healthy();
    value.problem.tam = "$20M";
    value.problem.solution = "Custom hardware for warehouses";
    value.gtm.priceOrAcv = "$50/month";
    value.capTable.founderEquityPercent = "20%";
    value.gtm.cac = "$4000";
    value.gtm.ltv = "$900";
    const report = buildReport(value, selectFollowUps(value));
    expect(report.verdict).toBe("bootstrap");
    expect(report.verdictLabel).toBe("Bootstrapping Recommended");
  });

  it("lets a credible follow-up clear a small-market miss", () => {
    const value = healthy();
    value.problem.tam = "$100M";
    const report = buildReport(value, [
      {
        id: "market_scale",
        pillar: "problem",
        question: "q",
        reason: "r",
        answer: "We will expand into adjacent logistics software, a $2B market.",
      },
    ]);
    expect(report.verdict).toBe("highly_fundable");
  });
});
