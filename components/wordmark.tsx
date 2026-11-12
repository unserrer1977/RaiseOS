import Link from "next/link";

export function Wordmark({ href = "/", suffix }: { href?: string; suffix?: string }) {
  return (
    <Link href={href} className="inline-flex flex-wrap items-baseline gap-x-2 text-ink">
      <span className="text-lg font-semibold tracking-[-0.02em]">Raise Insight</span>
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">by Angel OS</span>
      {suffix ? (
        <span className="ml-1 self-center rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-ink">
          {suffix}
        </span>
      ) : null}
    </Link>
  );
}
