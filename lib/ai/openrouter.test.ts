import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@openrouter/ai-sdk-provider", () => ({
  createOpenRouter: vi.fn(() => ({
    chat: (id: string) => ({ provider: "openrouter", modelId: id }),
  })),
}));

import { chatModel, DEFAULT_MODEL, modelConfigured, resolvedModelId } from "@/lib/ai/openrouter";

describe("openrouter", () => {
  afterEach(() => {
    delete process.env.OPENROUTER_API_KEY;
  });

  it("is configured when OPENROUTER_API_KEY is set", () => {
    expect(modelConfigured()).toBe(false);
    process.env.OPENROUTER_API_KEY = "sk-test";
    expect(modelConfigured()).toBe(true);
  });

  it("returns a chat model handle", () => {
    process.env.OPENROUTER_API_KEY = "sk-test";
    expect(resolvedModelId()).toBe(DEFAULT_MODEL);
    expect(chatModel()).toMatchObject({ modelId: DEFAULT_MODEL });
    process.env.OPENROUTER_MODEL = "anthropic/claude-3.5-sonnet";
    expect(resolvedModelId()).toBe("anthropic/claude-3.5-sonnet");
  });
});
