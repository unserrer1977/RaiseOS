import Link from "next/link";

export function Wordmark({ href = "/", suffix }: { href?: string; suffix?: string }) {
  return (
    <Link href={href} className="font-serif text-xl tracking-tight text-ink">
      RaiseOS
      {suffix ? <span className="ml-2 font-sans text-sm tracking-normal text-muted">{suffix}</span> : null}
    </Link>
  );
}
