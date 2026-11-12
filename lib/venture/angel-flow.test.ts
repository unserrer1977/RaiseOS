import { describe, expect, it } from "vitest";
import { emptyIntake } from "@/lib/types";
import { angelStructuralGaps } from "@/lib/venture/angel-flow";
import { prefillFromText, SAMPLE_DECK_TEXT } from "@/lib/extract/prefill";

describe("angelStructuralGaps", () => {
  it("lists at most four rule misses for an empty deck", () => {
    const gaps = angelStructuralGaps(emptyIntake());
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps.length).toBeLessThanOrEqual(4);
  });

  it("may be empty when the prefilled deck is venture-clean", () => {
    const { intake } = prefillFromText(SAMPLE_DECK_TEXT);
    expect(angelStructuralGaps(intake).length).toBeLessThanOrEqual(4);
  });
});
