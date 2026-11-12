"use client";

import { useState } from "react";
import type { Report } from "@/lib/types";

export function ReportView({ report, shareUrl }: { report: Report; shareUrl?: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  }

  return (
    <article>
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm uppercase tracking-[0.16em] text-muted">Venture scalability report</p>
        <div className="flex gap-2">
          {shareUrl ? (
            <button
              type="button"
              onClick={() => void copyLink()}
              className="rounded-full border border-line px-4 py-2 text-sm"
            >
              {copied ? "Link copied" : "Copy share link"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full bg-ink px-4 py-2 text-sm text-paper"
          >
            Download PDF
          </button>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted">{report.companyName}</p>
      <h1 className="mt-2 font-serif text-5xl text-ink">{report.verdictLabel}</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed">{report.rationale}</p>
      <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted">
        {report.narrativeSource === "model" ? "Narrative phrased by the model" : "Narrative from the rules"}
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Venture scale</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink">{report.ventureScale}</p>
      </section>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <FlagList title="Green flags" items={report.greenFlags} tone="good" />
        <FlagList title="Red flags" items={report.redFlags} tone="bad" />
      </div>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">SWOT</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Swot title="Strengths" items={report.swot.strengths} />
          <Swot title="Weaknesses" items={report.swot.weaknesses} />
          <Swot title="Opportunities" items={report.swot.opportunities} />
          <Swot title="Threats" items={report.swot.threats} />
        </div>
      </section>
    </article>
  );
}

function FlagList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "bad";
}) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h2 className={tone === "good" ? "text-accent" : "text-danger"}>{title}</h2>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function Swot({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="border-t border-line pt-4">
      <h3 className="text-sm uppercase tracking-[0.14em] text-muted">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm leading-relaxed">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
