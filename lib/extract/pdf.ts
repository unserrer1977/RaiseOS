import { extractText } from "unpdf";

export async function extractPdfText(data: Uint8Array): Promise<string> {
  const result = await extractText(data, { mergePages: true });
  return result.text;
}
