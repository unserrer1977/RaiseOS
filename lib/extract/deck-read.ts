/**
 * Pitch-deck reading adapted from GlenlunaVentures/angelosmt
 * (supabase/functions/_shared/deck-extract.ts): per-slide text, OCR on
 * image-only pages, slide-labelled output for intake and model extraction.
 */

import { generateText } from "ai";
import { chatModel, modelConfigured } from "@/lib/ai/openrouter";
import { extractPdfPageTexts } from "@/lib/extract/pdf";
import { extractPptxPages } from "@/lib/extract/pptx";

/** Pages with fewer meaningful characters than this are treated as image-only. */
export const MIN_PAGE_TEXT_CHARS = 40;
export const OCR_BATCH_PAGES = 5;
/** Keeps prompts bounded even for very long decks. */
export const MAX_DECK_TEXT_CHARS = 120_000;

export function normalisePageText(text: string): string {
  return text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/** 1-based page numbers that need OCR. */
export function pagesNeedingOcr(pages: string[], minChars = MIN_PAGE_TEXT_CHARS): number[] {
  const out: number[] = [];
  pages.forEach((p, i) => {
    if (p.replace(/\s+/g, "").length < minChars) out.push(i + 1);
  });
  return out;
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Splits an OCR reply of "=== Page N ===" blocks into a page -> text map. */
export function parseOcrReply(reply: string): Map<number, string> {
  const map = new Map<number, string>();
  const re = /===\s*Page\s+(\d+)\s*===\s*([\s\S]*?)(?====\s*Page\s+\d+\s*===|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(reply))) map.set(Number(m[1]), normalisePageText(m[2]));
  return map;
}

export function formatDeckText(pages: string[], maxChars = MAX_DECK_TEXT_CHARS): string {
  const body = pages
    .map((p, i) => `Slide ${i + 1}: ${p.trim() || "(no readable content)"}`)
    .join("\n\n");
  return body.length > maxChars
    ? `${body.slice(0, maxChars)}\n\n[Deck text shortened — later slides omitted]`
    : body;
}

export function isSlideLabelledDeckText(text: string): boolean {
  return /^Slide\s+1:\s/m.test(text.trim());
}

export type DeckReadResult = {
  text: string;
  pageCount: number;
  ocrPages: number[];
  truncated: boolean;
};

async function ocrPdfPages(pdfBytes: Uint8Array, pageNumbers: number[]): Promise<Map<number, string>> {
  const { PDFDocument } = await import("pdf-lib");
  const src = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const out = new Map<number, string>();

  for (const batch of chunk(pageNumbers, OCR_BATCH_PAGES)) {
    try {
      const doc = await PDFDocument.create();
      const copied = await doc.copyPages(
        src,
        batch.map((n) => n - 1),
      );
      copied.forEach((pg) => doc.addPage(pg));
      const partBytes = await doc.save();

      const { text: reply } = await generateText({
        model: chatModel(),
        timeout: 60_000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `This PDF holds pitch-deck pages ${batch.join(", ")} in order. Transcribe all visible text, numbers and chart/table values on each page. Output only blocks headed "=== Page N ===" using those original page numbers.`,
              },
              { type: "file", mediaType: "application/pdf", data: partBytes },
            ],
          },
        ],
      });

      const parsed = parseOcrReply(reply);
      if (parsed.size === 0 && batch.length === 1) parsed.set(batch[0], normalisePageText(reply));
      parsed.forEach((v, k) => out.set(k, v));
    } catch (error) {
      console.error("deck-read: OCR batch failed", batch, error);
    }
  }
  return out;
}

/** Per-slide PDF text, with optional OCR when OpenRouter is configured. */
export async function readPdfDeck(bytes: Uint8Array): Promise<DeckReadResult> {
  const pdfForText = bytes.slice();
  const pdfForOcr = bytes.slice();
  let pages = (await extractPdfPageTexts(pdfForText)).map(normalisePageText);
  const ocrPages = pagesNeedingOcr(pages);

  if (ocrPages.length > 0 && modelConfigured()) {
    const ocr = await ocrPdfPages(pdfForOcr, ocrPages);
    ocr.forEach((text, n) => {
      if (n >= 1 && n <= pages.length) pages[n - 1] = text;
    });
  }

  const text = formatDeckText(pages);
  if (!text.replace(/Slide \d+: \(no readable content\)/g, "").trim()) {
    throw new Error("No readable text could be found in the PDF.");
  }

  return {
    text,
    pageCount: pages.length,
    ocrPages: modelConfigured() ? ocrPages : [],
    truncated: text.includes("[Deck text shortened"),
  };
}

/** Slide-labelled text from a PPTX (no OCR — slides are already text XML). */
export async function readPptxDeck(bytes: Uint8Array): Promise<DeckReadResult> {
  const pages = (await extractPptxPages(bytes)).map(normalisePageText);
  const text = formatDeckText(pages);
  return {
    text,
    pageCount: pages.length,
    ocrPages: [],
    truncated: text.includes("[Deck text shortened"),
  };
}
