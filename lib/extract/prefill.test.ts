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
    expect(intake.company.country).toBe("United States");
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

const SLIDE_DECK_TEXT = `Fewer missed bins.
Pre-seed · £400k · Closing March 2027
Private and confidential. Prepared by Binwise Systems Ltd for the recipient only.
T E A M
Two operators who ran the rounds
Asha Verma
Co-founder and CEO
Ran waste contracts for three councils. Built the
first routing team at a logistics firm.
Tom Okafor
Co-founder and CTO
15 years of mapping software.
Backed by Northern Angels and two former council leaders
5
M A R K E T
A £2.4bn category. We start with councils
£30 a household a year
T H E A S K
Raising £400k £2.5m pre-money 13.8% equity SEIS & EIS
`;

describe("prefillFromText on a slide-style deck", () => {
  it("picks up the basics without labels", () => {
    const { intake } = prefillFromText(SLIDE_DECK_TEXT);
    expect(intake.company.legalName).toBe("Binwise Systems Ltd");
    expect(intake.company.country).toBe("United Kingdom");
    // Two named founders is not a stated headcount.
    expect(intake.company.teamSize).toBe("");
    expect(intake.company.founderBackgrounds).toContain("Asha Verma (Co-founder and CEO): Ran waste contracts");
    expect(intake.company.founderBackgrounds).toContain("Tom Okafor (Co-founder and CTO): 15 years of mapping software.");
    expect(intake.company.founderBackgrounds).not.toContain("Backed by");
    expect(intake.problem.tam).toBe("£2.4bn");
    expect(intake.gtm.priceOrAcv).toBe("£30 a household a year");
    expect(intake.capTable.stage).toBe("pre_seed");
    expect(intake.capTable.valuationOrCap).toBe("£2.5m pre-money");
    expect(intake.capTable.notableInvestors).toBe("Northern Angels and two former council leaders");
    // The size of the round being raised is not money already raised.
    expect(intake.capTable.amountRaised).toBe("");
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
