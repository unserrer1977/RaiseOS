import { PDFDocument, StandardFonts } from "pdf-lib";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatDeckText,
  isSlideLabelledDeckText,
  pagesNeedingOcr,
  parseOcrReply,
  readPdfDeck,
} from "@/lib/extract/deck-read";
import { extractPdfPageTexts } from "@/lib/extract/pdf";

const generateText = vi.fn();
vi.mock("ai", () => ({
  generateText: (...args: unknown[]) => generateText(...args),
  Output: { object: (value: unknown) => value },
}));

describe("deck-read helpers", () => {
  it("only low-text pages need OCR", () => {
    const pages = ["Our traction slide shows 120 paying customers and £40k MRR", "  ", "Team", "x".repeat(60)];
    expect(pagesNeedingOcr(pages)).toEqual([2, 3]);
  });

  it("deck text is slide-labelled", () => {
    const text = formatDeckText(["Problem", "", "Market"]);
    expect(text.startsWith("Slide 1: Problem")).toBe(true);
    expect(text).toContain("Slide 2: (no readable content)");
    expect(text).toContain("Slide 3: Market");
    expect(isSlideLabelledDeckText(text)).toBe(true);
  });

  it("OCR reply is split by page", () => {
    const map = parseOcrReply("=== Page 2 ===\nLogo and tagline\n=== Page 5 ===\nRevenue chart £1.2m");
    expect(map.get(2)).toBe("Logo and tagline");
    expect(map.get(5)).toBe("Revenue chart £1.2m");
  });
});

describe("readPdfDeck", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test";
    generateText.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    delete process.env.OPENROUTER_API_KEY;
    vi.restoreAllMocks();
  });

  it("produces slide-labelled text from northstar.pdf", async () => {
    const bytes = new Uint8Array(await readFile(path.join(process.cwd(), "fixtures/northstar.pdf")));
    const result = await readPdfDeck(bytes);
    expect(isSlideLabelledDeckText(result.text)).toBe(true);
    expect(result.pageCount).toBeGreaterThan(0);
    expect(result.text.toLowerCase()).toMatch(/northstar|tam|mrr/);
  });

  it("fills image-only slides via OCR when OpenRouter is configured", async () => {
    generateText.mockResolvedValue({ text: "=== Page 1 ===\nSecret Co\nTAM: $9B" });
    const doc = await PDFDocument.create();
    doc.addPage();
    const bytes = new Uint8Array(await doc.save());
    const result = await readPdfDeck(bytes);
    expect(result.ocrPages.length).toBeGreaterThan(0);
    expect(generateText).toHaveBeenCalled();
    expect(result.text).toContain("Secret Co");
  });

  it("extracts one string per page", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage();
    page.drawText("Hello slide one", { x: 50, y: 700, size: 12, font });
    const bytes = new Uint8Array(await doc.save());
    const pages = await extractPdfPageTexts(bytes);
    expect(pages.length).toBe(1);
    expect(pages[0]).toMatch(/Hello slide one/i);
  });
});
