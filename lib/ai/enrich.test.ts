import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emptyIntake } from "@/lib/types";

const generateText = vi.fn();
vi.mock("ai", () => ({
  generateText: (...args: unknown[]) => generateText(...args),
  Output: { object: (value: unknown) => value },
}));

import { enrichIntake } from "@/lib/ai/enrich";

const DECK = "Noticed. The memory layer for busy families. 500 people we surveyed. Raising £750k pre-seed.";

function modelSays(patch: (intake: ReturnType<typeof emptyIntake>) => void) {
  const output = emptyIntake();
  patch(output);
  return { output };
}

describe("enrichIntake", () => {
  beforeEach(() => {
    process.env.AI_GATEWAY_API_KEY = "test";
    generateText.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    delete process.env.AI_GATEWAY_API_KEY;
    vi.restoreAllMocks();
  });

  it("replaces a rules value but keeps what the person typed", async () => {
    generateText.mockResolvedValue(
      modelSays((intake) => {
        intake.company.teamSize = "2";
        intake.company.legalName = "Noticed Ltd";
        intake.capTable.stage = "pre_seed";
      }),
    );
    const current = emptyIntake();
    current.company.teamSize = "500";
    current.company.legalName = "Noticed";
    const result = await enrichIntake(DECK, current, { locked: new Set(["company.legalName"]) });
    expect(result?.intake.company.teamSize).toBe("2");
    expect(result?.intake.company.legalName).toBe("Noticed");
    expect(result?.intake.capTable.stage).toBe("pre_seed");
    expect(result?.filled.sort()).toEqual(["capTable.stage", "company.teamSize"]);
  });

  it("sends the PDF, and falls back to text when that fails", async () => {
    generateText
      .mockRejectedValueOnce(new Error("file too large"))
      .mockResolvedValueOnce(modelSays((intake) => (intake.problem.tam = "£690M")));
    const result = await enrichIntake(DECK, emptyIntake(), { pdf: new Uint8Array([37, 80, 68, 70, 45]) });
    expect(generateText).toHaveBeenCalledTimes(2);
    const first = generateText.mock.calls[0][0].messages[0].content;
    const second = generateText.mock.calls[1][0].messages[0].content;
    expect(first.some((part: { type: string }) => part.type === "file")).toBe(true);
    expect(second.some((part: { type: string }) => part.type === "file")).toBe(false);
    expect(result?.intake.problem.tam).toBe("£690M");
  });

  it("reads an image-only PDF that has no text", async () => {
    generateText.mockResolvedValue(modelSays((intake) => (intake.company.legalName = "Noticed Ltd")));
    const result = await enrichIntake("", emptyIntake(), { pdf: new Uint8Array([37, 80, 68, 70, 45]) });
    expect(result?.filled).toEqual(["company.legalName"]);
  });

  it("uses slide-labelled deck text without attaching the PDF", async () => {
    generateText.mockResolvedValue(modelSays((intake) => (intake.problem.tam = "£690M")));
    const labelled = `Slide 1: Noticed — the memory layer for busy families.\n\nSlide 2: TAM: £690M. SAM: £120M. We surveyed 500 parents and closed 12 design partners.`;
    const result = await enrichIntake(labelled, emptyIntake(), {
      pdf: new Uint8Array([37, 80, 68, 70, 45]),
    });
    expect(generateText).toHaveBeenCalledTimes(1);
    const content = generateText.mock.calls[0][0].messages[0].content;
    expect(content.some((part: { type: string }) => part.type === "file")).toBe(false);
    expect(result?.intake.problem.tam).toBe("£690M");
  });

  it("does nothing without a key", async () => {
    delete process.env.AI_GATEWAY_API_KEY;
    expect(await enrichIntake(DECK, emptyIntake())).toBeNull();
    expect(generateText).not.toHaveBeenCalled();
  });
});
