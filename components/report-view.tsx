"use client";

import Link from "next/link";
import { useState } from "react";
import { DownloadIcon, FlagIcon, LinkIcon } from "@/components/icons";
import { VERDICT_STYLE, VerdictIcon } from "@/components/verdict";
import type { Report } from "@/lib/types";

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six"];

function kickerFor(report: Report): string {
  if (report.verdict !== "bootstrap") return VERDICT_STYLE[report.verdict].kicker;
  const count = report.redFlags.length;
  return count >= 2 && count < WORDS.length ? `${WORDS[count]} gaps` : VERDICT_STYLE.bootstrap.kicker;
}

export function ReportView({
  report,
  shareUrl,
  dateLabel,
}: {
  report: Report;
  shareUrl?: string;
  dateLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const owner = Boolean(shareUrl);
  const style = VERDICT_STYLE[report.verdict] ?? VERDICT_STYLE.borderline;

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  }

  return (
    <article className="flex flex-col gap-10">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13px] uppercase tracking-[0.16em] text-muted">Venture scalability report</p>
        <div className="flex flex-wrap gap-2">
          {shareUrl ? (
            <button
              type="button"
              onClick={() => void copyLink()}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong px-4 text-sm"
            >
              <LinkIcon size={16} />
              <span aria-live="polite">{copied ? "Link copied" : "Copy share link"}</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm text-paper"
          >
            <DownloadIcon size={16} />
            Download PDF
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          {report.companyName}
          {dateLabel ? ` · ${dateLabel}` : ""}
        </p>
        <p
          className={`inline-flex items-center gap-2 self-start rounded-full px-3.5 py-1.5 text-[13px] font-semibold tracking-[0.04em] ${style.tint} ${style.text}`}
        >
          <VerdictIcon verdict={report.verdict} size={16} />
          {kickerFor(report)}
        </p>
        <h1 className="font-serif text-5xl leading-[1.05] tracking-[-0.01em] text-ink sm:text-[56px]">
          {report.verdictLabel}
        </h1>
        <p className="mt-2 max-w-2xl text-lg leading-relaxed sm:text-[19px]">{report.rationale}</p>
        <p className="text-xs uppercase tracking-[0.14em] text-muted">
          {report.narrativeSource === "model" ? "Narrative phrased by the model" : "Narrative from the rules"}
        </p>
      </div>

      <section className="flex flex-col gap-3 border-t border-line pt-8">
        <h2 className="font-serif text-[28px]">Venture scale</h2>
        <p className="max-w-2xl leading-relaxed text-ink">{report.ventureScale}</p>
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <FlagList title="Green flags" items={report.greenFlags} tone="good" />
        <FlagList title="Red flags" items={report.redFlags} tone="bad" />
      </div>

      <section className="flex flex-col gap-5">
        <h2 className="font-serif text-[28px]">SWOT</h2>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Swot title="Strengths" items={report.swot.strengths} />
          <Swot title="Weaknesses" items={report.swot.weaknesses} />
          <Swot title="Opportunities" items={report.swot.opportunities} />
          <Swot title="Threats" items={report.swot.threats} />
        </div>
      </section>

      {owner ? (
        <div className="no-print flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <p className="text-[15px] text-muted">Fixed something in the deck? Run a new assessment.</p>
          <Link href="/home" className="text-[15px] text-ink underline underline-offset-4">
            Start a new assessment
          </Link>
        </div>
      ) : (
        <div className="no-print flex flex-wrap items-center justify-between gap-5 rounded-[20px] bg-ink p-8 text-paper">
          <p className="max-w-md font-serif text-[26px] leading-tight">Get a read on your own company.</p>
          <Link
            href="/register"
            className="inline-flex min-h-12 items-center rounded-full bg-paper px-6 text-[15px] text-ink"
          >
            Register
          </Link>
        </div>
      )}
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
    <section className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-6">
      <h2
        className={`flex items-center gap-2 font-semibold ${tone === "good" ? "text-accent" : "text-danger"}`}
      >
        <FlagIcon />
        {title}
      </h2>
      <ul className="flex list-disc flex-col gap-2 pl-[18px] text-[15px] leading-relaxed">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function Swot({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="flex flex-col gap-2 border-t border-ink pt-3.5">
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">{title}</h3>
      <ul className="flex list-disc flex-col gap-1.5 pl-[18px] text-[15px] leading-relaxed">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
