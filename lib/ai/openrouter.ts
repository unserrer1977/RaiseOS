import { createOpenRouter } from "@openrouter/ai-sdk-provider";

/** Default when `OPENROUTER_MODEL` is unset. Must accept PDF file parts for refine/OCR. */
export const DEFAULT_MODEL = "google/gemini-3.5-flash-lite";

/** @deprecated Use {@link resolvedModelId} / `chatModel()`. */
export const DECK_MODEL = DEFAULT_MODEL;

export function modelConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}

export function resolvedModelId(): string {
  return process.env.OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;
}

function getProvider() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");
  return createOpenRouter({ apiKey });
}

export function chatModel(modelId = resolvedModelId()) {
  return getProvider().chat(modelId);
}
