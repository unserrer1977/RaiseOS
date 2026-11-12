import { createOpenRouter } from "@openrouter/ai-sdk-provider";

/** Fast model for intake extraction and deck OCR (OpenRouter id). */
export const DECK_MODEL = "google/gemini-2.5-flash";

export function modelConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}

function getProvider() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");
  return createOpenRouter({ apiKey });
}

export function chatModel(modelId = DECK_MODEL) {
  return getProvider().chat(modelId);
}
