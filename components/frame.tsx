import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { ACCOUNTS_ENABLED } from "@/lib/features";

export function Frame({
  email,
  flow = "founder",
  children,
}: {
  email?: string | null;
  flow?: "founder" | "angel";
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-full w-full max-w-3xl px-5 py-8">
      <header className="no-print flex flex-wrap items-center justify-between gap-4">
        <Wordmark href={flow === "angel" || !ACCOUNTS_ENABLED ? "/angel" : "/"} suffix={flow === "angel" ? "for angels" : undefined} />
        <nav aria-label={flow === "angel" ? "Main" : "Account"} className="flex flex-wrap items-center gap-4 text-sm text-muted">
          {flow === "angel" || !ACCOUNTS_ENABLED ? (
            <Link href="/angel" className="text-ink">
              Assess a deck
            </Link>
          ) : email ? (
            <>
              <Link href="/home" className="hover:text-ink">
                Assessments
              </Link>
              <span className="hidden sm:inline">{email}</span>
              <form action="/auth/signout" method="post">
                <button type="submit" className="text-ink">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-ink">
                Sign in
              </Link>
              <Link href="/register" className="text-ink">
                Register
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="py-12">{children}</main>
    </div>
  );
}
