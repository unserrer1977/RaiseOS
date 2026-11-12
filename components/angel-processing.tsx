"use client";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useEffect, useRef, useState } from "react";
import { SparkleIcon, AlertCircleIcon } from "@/components/icons";
import { advanceAngelAssessment } from "@/lib/actions";
import type { Intake } from "@/lib/types";

type Phase = "reading" | "scoring" | "error";

export function AngelProcessing({
  id,
  initialIntake,
  extractionNote,
}: {
  id: string;
  initialIntake: Intake;
  extractionNote: string | null;
}) {
  const [phase, setPhase] = useState<Phase>("reading");
  const [error, setError] = useState("");
  const [note] = useState(extractionNote);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void (async () => {
      setError("");
      const response = await fetch(`/api/assessments/${id}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake: initialIntake }),
      }).catch(() => null);
      if (!response?.ok) {
        setPhase("error");
        setError("The deck could not be read. Try uploading again.");
        return;
      }
      setPhase("scoring");
      try {
        const result = await advanceAngelAssessment(id);
        if (result && "error" in result && result.error) {
          setPhase("error");
          setError(result.error);
        }
      } catch (error) {
        if (isRedirectError(error)) return;
        setPhase("error");
        setError("Something went wrong. Try again.");
      }
    })();
  }, [id, initialIntake]);

  if (phase === "error") {
    return (
      <div className="flex flex-col gap-4">
        <p className="flex items-center gap-2 text-danger" role="alert">
          <AlertCircleIcon size={18} />
          {error}
        </p>
        <a href="/angel" className="text-[15px] text-ink underline underline-offset-4">
          Back to upload
        </a>
      </div>
    );
  }

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted">Reading the deck</p>
      <h1 className="text-3xl font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-4xl">
        {phase === "reading" ? "Pulling facts from the slides…" : "Checking venture fit…"}
      </h1>
      <p className="text-muted">
        {phase === "reading"
          ? "We extract what the deck states into the assessment. This usually takes under a minute when the model is on."
          : "We score venture fit from the deck only, then list questions for the founders with each gap named."}
      </p>
      {note ? (
        <p
          className="flex items-start gap-2.5 rounded-md border border-warn/25 bg-warn-tint/60 px-3.5 py-3 text-sm text-warn"
          role="status"
        >
          <span className="mt-0.5 shrink-0">
            <AlertCircleIcon />
          </span>
          {note}
        </p>
      ) : null}
      <p className="inline-flex items-center gap-2 text-sm text-muted">
        <SparkleIcon size={16} className="animate-pulse" />
        Working…
      </p>
    </div>
  );
}
