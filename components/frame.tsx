import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

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
        <Wordmark href={flow === "angel" ? "/angel" : "/"} suffix={flow === "angel" ? "for angels" : undefined} />
        <nav aria-label={flow === "angel" ? "Main" : "Account"} className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px] text-muted">
          {flow === "angel" ? (
            <Link href="/angel" className="font-medium text-ink">
              Assess a deck
            </Link>
          ) : email ? (
            <>
              <Link href="/home" className="hover:text-ink">
                Assessments
              </Link>
              <span className="hidden sm:inline">{email}</span>
              <form action="/auth/signout" method="post">
                <button type="submit" className="min-h-11 font-medium text-ink">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-ink">
                Sign in
              </Link>
              <Link href="/register" className="font-medium text-ink">
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
