import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Frame } from "@/components/frame";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  await connection();
  const { user } = await getSessionUser();
  if (user) redirect("/home");

  return (
    <Frame>
      <p className="text-sm uppercase tracking-[0.16em] text-muted">For early-stage founders</p>
      <h1 className="mt-4 max-w-xl font-serif text-5xl leading-tight text-ink">
        A partner’s read on whether this is a venture-scale company.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted">
        Upload the deck. RaiseOS fills the intake, asks at most four follow-ups when the story does not hold, and leaves you with a fundability report you can share.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/register" className="rounded-full bg-ink px-5 py-3 text-sm text-paper">
          Register
        </Link>
        <Link href="/login" className="rounded-full border border-line px-5 py-3 text-sm">
          Sign in
        </Link>
      </div>
    </Frame>
  );
}
