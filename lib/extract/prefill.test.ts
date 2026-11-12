import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { extractPdfText } from "@/lib/extract/pdf";
import { SAMPLE_DECK_TEXT, prefillFromText } from "@/lib/extract/prefill";
import { buildPptx, extractPptxText } from "@/lib/extract/pptx";
import { selectFollowUps } from "@/lib/venture/rules";

describe("prefillFromText", () => {
  it("maps the labeled sample deck onto the intake", () => {
    const { intake, sources, thin } = prefillFromText(SAMPLE_DECK_TEXT);
    expect(thin).toBe(false);
    expect(intake.company.legalName).toBe("Northstar Labs Inc.");
    expect(intake.company.headquarters).toBe("Austin, TX");
    expect(intake.company.teamSize).toBe("6");
    expect(intake.problem.tam).toBe("$100M");
    expect(intake.problem.solution).toContain("SaaS");
    expect(intake.gtm.priceOrAcv).toBe("$50/month");
    expect(intake.gtm.customerType).toBe("b2b_enterprise");
    expect(intake.traction.momGrowth).toBe("18%");
    expect(intake.capTable.stage).toBe("seed");
    expect(intake.capTable.founderEquityPercent).toBe("28%");
    expect(sources["problem.tam"]).toBe("deck");
    expect(selectFollowUps(intake).map((item) => item.id)).toEqual([
      "market_scale",
      "gtm_plg",
      "cap_table",
      "unit_economics",
    ]);
  });
});

describe("deck files", () => {
  it("reads the same labels back out of a PDF", async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 900]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    SAMPLE_DECK_TEXT.split("\n").forEach((line, index) => {
      page.drawText(line, { x: 40, y: 860 - index * 18, size: 10, font });
    });
    const text = await extractPdfText(await doc.save());
    const { intake } = prefillFromText(text);
    expect(intake.company.legalName).toBe("Northstar Labs Inc.");
    expect(intake.problem.tam).toBe("$100M");
    expect(intake.capTable.founderEquityPercent).toBe("28%");
    expect(intake.gtm.priceOrAcv).toBe("$50/month");
  });

  it("reads labeled lines out of a PPTX", async () => {
    const bytes = await buildPptx(SAMPLE_DECK_TEXT.split("\n"));
    const text = await extractPptxText(bytes);
    const { intake } = prefillFromText(text);
    expect(intake.company.legalName).toBe("Northstar Labs Inc.");
    expect(intake.problem.tam).toBe("$100M");
    expect(intake.gtm.customerType).toBe("b2b_enterprise");
  });
});
