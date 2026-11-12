import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export function Frame({
  email,
  children,
}: {
  email?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-full w-full max-w-3xl px-5 py-8">
      <header className="no-print flex items-center justify-between">
        <Wordmark />
        <nav className="flex items-center gap-4 text-sm text-muted">
          {email ? (
            <>
              <Link href="/home">Assessments</Link>
              <span className="hidden sm:inline">{email}</span>
              <form action="/auth/signout" method="post">
                <button type="submit" className="text-ink">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Sign in</Link>
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
