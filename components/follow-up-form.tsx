"use client";

import { useState } from "react";
import { submitFollowUps } from "@/lib/actions";
import type { FollowUp } from "@/lib/types";

export function FollowUpForm({ id, questions }: { id: string; questions: FollowUp[] }) {
  const [answers, setAnswers] = useState(questions);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit() {
    setPending(true);
    setError("");
    const result = await submitFollowUps(
      id,
      answers.map((item) => ({ id: item.id, answer: item.answer })),
    );
    if (result && "error" in result && result.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div>
      <p className="text-sm uppercase tracking-[0.16em] text-muted">Follow-up</p>
      <h1 className="mt-3 font-serif text-4xl text-ink">A few things a partner would ask.</h1>
      <p className="mt-4 text-muted">
        {answers.length} question{answers.length === 1 ? "" : "s"}. This is the last step.
      </p>
      <div className="mt-10 space-y-10">
        {answers.map((item, index) => (
          <label key={item.id} className="block">
            <span className="font-serif text-2xl text-ink">{item.question}</span>
            <span className="mt-2 block text-sm text-muted">{item.reason}</span>
            <textarea
              value={item.answer}
              rows={4}
              onChange={(event) =>
                setAnswers((current) =>
                  current.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, answer: event.target.value } : entry,
                  ),
                )
              }
              className="mt-4 w-full resize-none border-b border-line bg-transparent py-3 text-lg outline-none focus:border-accent"
            />
          </label>
        ))}
      </div>
      {error ? (
        <p className="mt-6 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => void onSubmit()}
        disabled={pending}
        className="mt-10 rounded-full bg-ink px-6 py-3 text-sm text-paper disabled:opacity-60"
      >
        {pending ? "Writing the report…" : "See the assessment"}
      </button>
    </div>
  );
}
