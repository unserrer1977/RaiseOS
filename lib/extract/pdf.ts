import { extractText } from "unpdf";

export async function extractPdfText(data: Uint8Array): Promise<string> {
  const result = await extractText(data, { mergePages: true });
  return result.text;
}

/** One string per PDF page, in order. */
export async function extractPdfPageTexts(data: Uint8Array): Promise<string[]> {
  const result = await extractText(data, { mergePages: false });
  return result.text as string[];
}
