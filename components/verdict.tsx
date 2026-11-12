import { CheckCircleIcon, MinusCircleIcon, WarningIcon } from "@/components/icons";
import type { Verdict } from "@/lib/types";

export const VERDICT_STYLE: Record<
  Verdict,
  { kicker: string; text: string; tint: string; border: string }
> = {
  highly_fundable: {
    kicker: "Venture fit",
    text: "text-accent",
    tint: "bg-accent-tint",
    border: "border-accent",
  },
  borderline: {
    kicker: "One gap",
    text: "text-warn",
    tint: "bg-warn-tint",
    border: "border-warn",
  },
  bootstrap: {
    kicker: "Structural gaps",
    text: "text-danger",
    tint: "bg-danger-tint",
    border: "border-danger",
  },
};

export function VerdictIcon({ verdict, size }: { verdict: Verdict; size?: number }) {
  if (verdict === "highly_fundable") return <CheckCircleIcon size={size} />;
  if (verdict === "borderline") return <MinusCircleIcon size={size} />;
  return <WarningIcon size={size} />;
}

export function VerdictPill({ verdict, label }: { verdict: Verdict; label: string }) {
  const style = VERDICT_STYLE[verdict];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[13px] ${style.border} ${style.text}`}
    >
      <VerdictIcon verdict={verdict} size={14} />
      {label}
    </span>
  );
}
