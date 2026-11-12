"use client";

import { useEffect, useState } from "react";
import { saveIntake, submitIntake } from "@/lib/actions";
import { PILLARS } from "@/lib/pillars";
import {
  fieldPath,
  type ExtractionMode,
  type FieldSource,
  type Intake,
  type PillarId,
} from "@/lib/types";

export function IntakeForm({
  id,
  initialIntake,
  initialSources,
  extractionMode,
  extractionNote,
}: {
  id: string;
  initialIntake: Intake;
  initialSources: Record<string, FieldSource>;
  extractionMode: ExtractionMode;
  extractionNote: string | null;
}) {
  const [step, setStep] = useState(0);
  const [intake, setIntake] = useState(initialIntake);
  const [sources, setSources] = useState(initialSources);
  const [mode, setMode] = useState(extractionMode);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const pillar = PILLARS[step];

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const response = await fetch(`/api/assessments/${id}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake: initialIntake }),
      });
      if (!response.ok || cancelled) return;
      const payload = (await response.json()) as {
        mode?: ExtractionMode;
        intake?: Intake;
        filled?: string[];
      };
      if (payload.mode === "model") setMode("model");
      if (!payload.intake || !payload.filled?.length || cancelled) return;
      setIntake((current) => mergeEmpty(current, payload.intake as Intake, payload.filled ?? []));
      setSources((current) => {
        const next = { ...current };
        for (const path of payload.filled ?? []) next[path] = "deck";
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [id, initialIntake]);

  function update(pillarId: PillarId, key: string, value: string) {
    setIntake((current) => ({
      ...current,
      [pillarId]: { ...current[pillarId], [key]: value },
    }));
    setSources((current) => ({ ...current, [fieldPath(pillarId, key)]: "founder" }));
  }

  async function continueStep() {
    setPending(true);
    setError("");
    const last = step === PILLARS.length - 1;
    const result = last
      ? await submitIntake(id, intake, sources)
      : await saveIntake(id, intake, sources);
    if (result && "error" in result && result.error) {
      setError(result.error);
      setPending(false);
      return;
    }
    if (!last) {
      setStep((value) => value + 1);
      setPending(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          {step + 1} of {PILLARS.length}
        </span>
        <span>{mode === "model" ? "Model-assisted prefill" : "Rules prefill"}</span>
      </div>
      <div className="mt-3 h-1 bg-line">
        <div
          className="h-1 bg-accent"
          style={{ width: `${((step + 1) / PILLARS.length) * 100}%` }}
        />
      </div>
      {extractionNote ? <p className="mt-6 text-sm text-warn">{extractionNote}</p> : null}
      <p className="mt-8 text-sm uppercase tracking-[0.16em] text-muted">{pillar.kicker}</p>
      <h1 className="mt-3 font-serif text-4xl text-ink">{pillar.title}</h1>
      <div className="mt-8 space-y-6">
        {pillar.fields.map((field) => {
          const path = fieldPath(pillar.id, field.key);
          const value = (intake[pillar.id] as unknown as Record<string, string>)[field.key] ?? "";
          return (
            <label key={field.key} className="block">
              <span className="flex items-center justify-between text-sm text-muted">
                {field.label}
                {sources[path] === "deck" ? <span className="text-accent">From deck</span> : null}
              </span>
              {field.kind === "select" ? (
                <select
                  value={value}
                  onChange={(event) => update(pillar.id, field.key, event.target.value)}
                  className="mt-2 w-full border-b border-line bg-transparent py-3 text-lg outline-none focus:border-accent"
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.kind === "textarea" ? (
                <textarea
                  value={value}
                  rows={3}
                  placeholder={field.placeholder}
                  onChange={(event) => update(pillar.id, field.key, event.target.value)}
                  className="mt-2 w-full resize-none border-b border-line bg-transparent py-3 text-lg outline-none focus:border-accent"
                />
              ) : (
                <input
                  value={value}
                  placeholder={field.placeholder}
                  onChange={(event) => update(pillar.id, field.key, event.target.value)}
                  className="mt-2 w-full border-b border-line bg-transparent py-3 text-lg outline-none placeholder:text-muted/70 focus:border-accent"
                />
              )}
            </label>
          );
        })}
      </div>
      {error ? (
        <p className="mt-6 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          className="text-sm text-muted disabled:opacity-40"
          disabled={step === 0 || pending}
          onClick={() => setStep((value) => value - 1)}
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => void continueStep()}
          disabled={pending}
          className="rounded-full bg-ink px-6 py-3 text-sm text-paper disabled:opacity-60"
        >
          {pending ? "Saving…" : step === PILLARS.length - 1 ? "Continue" : "Next"}
        </button>
      </div>
    </div>
  );
}

function mergeEmpty(current: Intake, incoming: Intake, filled: string[]): Intake {
  const next = structuredClone(current);
  for (const path of filled) {
    const [pillar, key] = path.split(".") as [keyof Intake, string];
    const local = (next[pillar] as unknown as Record<string, string>)[key];
    if (typeof local === "string" && local.trim()) continue;
    const value = (incoming[pillar] as unknown as Record<string, string>)[key];
    if (typeof value === "string") {
      (next[pillar] as unknown as Record<string, string>)[key] = value;
    }
  }
  return next;
}
