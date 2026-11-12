"use client";

import { useEffect, useRef, useState } from "react";
import { saveIntake, submitIntake, type Flow } from "@/lib/actions";
import { AlertCircleIcon, FileIcon, SparkleIcon } from "@/components/icons";
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
  flow = "founder",
}: {
  id: string;
  flow?: Flow;
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
  const [reading, setReading] = useState(extractionMode !== "model");
  const [note, setNote] = useState(extractionNote);
  const edited = useRef(new Set<string>());
  const pillar = PILLARS[step];

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const response = await fetch(`/api/assessments/${id}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake: initialIntake }),
      }).catch(() => null);
      if (!cancelled) setReading(false);
      if (!response?.ok || cancelled) return;
      const payload = (await response.json()) as {
        mode?: ExtractionMode;
        intake?: Intake;
        filled?: string[];
      };
      if (payload.mode === "model") setMode("model");
      if (!payload.intake || !payload.filled?.length || cancelled) return;
      // Take the model's reading of the deck, except for fields typed since.
      const filled = payload.filled.filter((path) => !edited.current.has(path));
      setNote(null);
      setIntake((current) => mergeFromDeck(current, payload.intake as Intake, filled));
      setSources((current) => {
        const next = { ...current };
        for (const path of filled) next[path] = "deck";
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
    edited.current.add(fieldPath(pillarId, key));
    setSources((current) => ({ ...current, [fieldPath(pillarId, key)]: "founder" }));
  }

  async function continueStep() {
    setPending(true);
    setError("");
    const last = step === PILLARS.length - 1;
    const result = last
      ? await submitIntake(id, intake, sources, flow)
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

  const underline =
    "w-full border-0 border-b border-line-strong bg-transparent py-3 text-lg text-ink outline-none focus:border-accent";

  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm text-muted">
        <span>
          {step + 1} of {PILLARS.length}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <SparkleIcon size={14} />
          {reading ? "Reading your deck…" : mode === "model" ? "Model-assisted prefill" : "Rules prefill"}
        </span>
      </div>
      <div
        className="mt-3 h-1 rounded-full bg-line"
        role="progressbar"
        aria-label="Intake progress"
        aria-valuemin={1}
        aria-valuemax={PILLARS.length}
        aria-valuenow={step + 1}
      >
        <div
          className="h-1 rounded-full bg-accent transition-[width]"
          style={{ width: `${((step + 1) / PILLARS.length) * 100}%` }}
        />
      </div>
      {note && !reading ? (
        <p
          className="mt-6 flex items-start gap-2.5 rounded-xl border border-warn/25 bg-warn-tint/60 px-3.5 py-3 text-sm text-warn"
          role="status"
        >
          <span className="mt-0.5 shrink-0">
            <AlertCircleIcon />
          </span>
          {note}
        </p>
      ) : null}
      <p className="mt-10 text-[13px] uppercase tracking-[0.16em] text-muted">{pillar.kicker}</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-[40px]">
        {flow === "angel" ? (pillar.angelTitle ?? pillar.title) : pillar.title}
      </h1>
      {flow === "angel" && step === 0 ? (
        <p className="mt-4 max-w-xl text-muted">
          We filled in what the deck says. Check it, and add anything the founder has told you. Leave a
          field blank if you don’t know: a gap is a finding too.
        </p>
      ) : null}
      <div className="mt-8 flex flex-col gap-7">
        {pillar.fields.map((field) => {
          const path = fieldPath(pillar.id, field.key);
          const value = (intake[pillar.id] as unknown as Record<string, string>)[field.key] ?? "";
          return (
            <label key={field.key} className="flex flex-col gap-0.5">
              <span className="flex items-center justify-between gap-3 text-sm text-muted">
                {field.label}
                {sources[path] === "deck" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-tint px-2.5 py-0.5 text-xs text-accent">
                    <FileIcon size={12} />
                    From deck
                  </span>
                ) : null}
              </span>
              {field.kind === "select" ? (
                <select
                  value={value}
                  onChange={(event) => update(pillar.id, field.key, event.target.value)}
                  className={`${underline} min-h-12`}
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
                  className={`${underline} resize-none leading-normal`}
                />
              ) : (
                <input
                  value={value}
                  placeholder={field.placeholder}
                  onChange={(event) => update(pillar.id, field.key, event.target.value)}
                  className={underline}
                />
              )}
            </label>
          );
        })}
      </div>
      {error ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-danger" role="alert">
          <AlertCircleIcon size={16} />
          {error}
        </p>
      ) : null}
      <div className="mt-12 flex items-center justify-between gap-4">
        <button
          type="button"
          className="min-h-11 px-1 text-[15px] text-muted disabled:opacity-40"
          disabled={step === 0 || pending}
          onClick={() => setStep((value) => value - 1)}
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => void continueStep()}
          disabled={pending}
          className="min-h-12 rounded-full bg-ink px-7 text-[15px] text-paper disabled:opacity-60"
        >
          {pending ? "Saving…" : step === PILLARS.length - 1 ? "Continue" : "Next"}
        </button>
      </div>
      <p className="mt-4 text-right text-[13px] text-muted">Saved automatically at every step.</p>
    </div>
  );
}

function mergeFromDeck(current: Intake, incoming: Intake, filled: string[]): Intake {
  const next = structuredClone(current);
  for (const path of filled) {
    const [pillar, key] = path.split(".") as [keyof Intake, string];
    const value = (incoming[pillar] as unknown as Record<string, string>)[key];
    if (typeof value === "string") {
      (next[pillar] as unknown as Record<string, string>)[key] = value;
    }
  }
  return next;
}
