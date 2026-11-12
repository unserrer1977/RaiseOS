"use client";

import { useState } from "react";
import { AlertCircleIcon } from "@/components/icons";
import { submitFollowUps, type Flow } from "@/lib/actions";
import { PILLARS } from "@/lib/pillars";
import type { FollowUp } from "@/lib/types";

const TOPIC: Record<FollowUp["id"], string> = {
  market_scale: "market scale",
  gtm_plg: "sales motion",
  cap_table: "founder ownership",
  unit_economics: "unit economics",
  traction_evidence: "traction evidence",
};

function lowerFirst(text: string): string {
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

const COPY = {
  founder: {
    kicker: "Follow-up",
    title: "A few things a partner would ask.",
    count: (n: number) => `${n} question${n === 1 ? "" : "s"}. This is the last step.`,
    why: "Why we ask",
    placeholder: "Your answer",
    note: "Answers are optional. A good answer can repair a gap.",
  },
  angel: {
    kicker: "Before you commit",
    title: "What to ask the founder.",
    count: (n: number) =>
      `${n} open question${n === 1 ? "" : "s"} from the deck. Answer what you already know. Anything you leave blank is worth asking before you invest.`,
    why: "Why it matters",
    placeholder: "What you know so far",
    note: "Answers are optional. A good answer can close a gap; a blank one stays in the report as a risk.",
  },
} as const;

export function FollowUpForm({
  id,
  questions,
  flow = "founder",
}: {
  id: string;
  questions: FollowUp[];
  flow?: Flow;
}) {
  const copy = COPY[flow];
  const [answers, setAnswers] = useState(questions);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit() {
    setPending(true);
    setError("");
    const result = await submitFollowUps(
      id,
      answers.map((item) => ({ id: item.id, answer: item.answer })),
      flow,
    );
    if (result && "error" in result && result.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div>
      <p className="text-[13px] uppercase tracking-[0.16em] text-muted">{copy.kicker}</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-[40px]">
        {copy.title}
      </h1>
      <p className="mt-4 max-w-xl text-muted">{copy.count(answers.length)}</p>

      <ol className="mt-12 flex flex-col gap-12">
        {answers.map((item, index) => {
          const pillar = PILLARS.find((entry) => entry.id === item.pillar)?.kicker ?? "";
          return (
            <li key={item.id} className="flex gap-5">
              <span aria-hidden="true" className="w-7 shrink-0 font-serif text-xl text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <label className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.14em] text-muted">
                  {pillar ? `${pillar} · ` : ""}
                  {TOPIC[item.id] ?? item.id.replaceAll("_", " ")}
                </span>
                <span className="font-serif text-2xl leading-snug text-ink">{item.question}</span>
                <span className="text-sm text-muted">{copy.why}: {lowerFirst(item.reason)}</span>
                <textarea
                  value={item.answer}
                  rows={4}
                  placeholder={copy.placeholder}
                  onChange={(event) =>
                    setAnswers((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, answer: event.target.value } : entry,
                      ),
                    )
                  }
                  className="mt-2 w-full resize-none border-0 border-b border-line-strong bg-transparent py-3 text-lg leading-normal outline-none focus:border-accent"
                />
              </label>
            </li>
          );
        })}
      </ol>

      {error ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-danger" role="alert">
          <AlertCircleIcon size={16} />
          {error}
        </p>
      ) : null}

      <div className="mt-14 flex flex-wrap items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => void onSubmit()}
          disabled={pending}
          className="min-h-12 rounded-full bg-ink px-7 text-[15px] text-paper disabled:opacity-60"
        >
          {pending ? "Writing the report…" : "See the assessment"}
        </button>
      </div>
      <p className="mt-4 text-right text-[13px] text-muted">
        {copy.note}
      </p>
    </div>
  );
}
