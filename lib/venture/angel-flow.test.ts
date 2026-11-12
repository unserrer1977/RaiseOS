import { describe, expect, it } from "vitest";
import { emptyIntake } from "@/lib/types";
import { angelGapQuestions, angelNeedsGapStep } from "@/lib/venture/angel-flow";
import { SAMPLE_DECK_TEXT } from "@/lib/extract/prefill";
import { prefillFromText } from "@/lib/extract/prefill";

describe("angel flow gaps", () => {
  it("asks no gap questions when the intake is venture-clean", () => {
    const { intake } = prefillFromText(SAMPLE_DECK_TEXT);
    expect(angelGapQuestions(intake).length).toBeLessThanOrEqual(4);
    if (angelGapQuestions(intake).length === 0) {
      expect(angelNeedsGapStep(intake)).toBe(false);
    }
  });

  it("opens a gap step when market and traction are missing", () => {
    const gaps = angelGapQuestions(emptyIntake());
    expect(gaps.length).toBeGreaterThan(0);
    expect(angelNeedsGapStep(emptyIntake())).toBe(true);
    expect(gaps.length).toBeLessThanOrEqual(4);
  });
});
