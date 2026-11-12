import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/wordmark";
import { CheckCircleIcon, MinusCircleIcon, WarningIcon } from "@/components/icons";
import { getSessionUser } from "@/lib/auth";

const STEPS = [
  {
    title: "Upload the deck",
    body: "PDF or PPTX. RaiseOS reads it and fills a five-part intake: company, problem, go-to-market, traction and cap table.",
  },
  {
    title: "Answer what a partner would ask",
    body: "Check the numbers, then answer up to four follow-ups that appear only where the venture story breaks.",
  },
  {
    title: "Get the verdict",
    body: "A fundability report with green and red flags and a SWOT. Share it by private link or save it as a PDF.",
  },
];

const VERDICTS = [
  {
    kicker: "Venture fit",
    title: "Highly Fundable",
    body: "No structural gaps, a market that can carry a £1B outcome, and traction on the page.",
    tone: "text-accent",
    Icon: CheckCircleIcon,
  },
  {
    kicker: "One gap",
    title: "Borderline/Niche",
    body: "Fundable only in a narrow sense. One structural gap, or a key input still missing.",
    tone: "text-warn",
    Icon: MinusCircleIcon,
  },
  {
    kicker: "Two or more gaps",
    title: "Bootstrapping Recommended",
    body: "Venture money is the wrong tool today. The report says why, so you can fix it or fund it another way.",
    tone: "text-danger",
    Icon: WarningIcon,
  },
];

const BENEFITS = [
  {
    title: "Minutes, not meetings",
    body: "The deck does most of the typing. You only check the numbers and fill the gaps.",
  },
  {
    title: "Know what to fix",
    body: "Red flags name the exact gap: market size, go-to-market, cap table, unit economics, margins or traction.",
  },
  {
    title: "Honest about bootstrapping",
    body: "If a seed fund is the wrong instrument, you hear it now, not after months of pitching.",
  },
  {
    title: "Easy to share",
    body: "A private link shows only the finished report. Send it to a co-founder, advisor or accelerator.",
  },
];

const FAQ = [
  {
    q: "Which files can I upload?",
    a: "PDF or PPTX up to 50 MB. Export Keynote decks to PDF first. Image-only slides have to be filled in by hand.",
  },
  {
    q: "Is my deck private?",
    a: "Decks are kept in private storage on your account and are not used to train a model. Share links show the finished report only, never the deck.",
  },
  {
    q: "How is the verdict decided?",
    a: "Clear venture rules on market size, go-to-market, ownership, unit economics, margins and traction. Your follow-up answers can repair a gap.",
  },
];

const primaryButton =
  "inline-flex min-h-12 items-center rounded-full bg-ink px-6 text-[15px] text-paper";
const secondaryButton =
  "inline-flex min-h-12 items-center rounded-full border border-line-strong px-6 text-[15px] text-ink";

export default async function HomePage() {
  await connection();
  const { user } = await getSessionUser();
  if (user && !user.isAnonymous) redirect("/home");

  return (
    <div className="min-h-full">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-7">
        <Wordmark />
        <nav aria-label="Main" className="flex flex-wrap items-center gap-6 text-[15px] text-muted">
          <a href="#how" className="hidden hover:text-ink sm:inline">
            How it works
          </a>
          <a href="#report" className="hidden hover:text-ink sm:inline">
            The report
          </a>
          <a href="#faq" className="hidden hover:text-ink sm:inline">
            FAQ
          </a>
          <Link href="/login" className="hover:text-ink">
            Sign in
          </Link>
          <Link href="/register" className="font-medium text-ink">
            Register
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto flex max-w-6xl flex-wrap items-center gap-16 px-6 pb-24 pt-12 sm:pt-16">
          <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-6">
            <p className="text-[13px] uppercase tracking-[0.16em] text-muted">For early-stage founders</p>
            <h1 className="font-serif text-5xl leading-[1.04] tracking-[-0.02em] sm:text-[64px]">
              A partner’s read on whether this is a venture-scale company.
            </h1>
            <p className="max-w-xl text-lg text-muted sm:text-[19px]">
              Upload the deck. RaiseOS fills the intake, asks at most four follow-ups when the story does
              not hold, and leaves you with a fundability report you can share.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link href="/register" className={primaryButton}>
                Register
              </Link>
              <Link href="/login" className={secondaryButton}>
                Sign in
              </Link>
            </div>
            <p className="text-sm text-muted">
              Your deck stays in private storage and is not used to train a model.
            </p>
          </div>

          <figure
            aria-label="Sample report preview"
            className="flex min-w-0 flex-[1_1_380px] flex-col gap-4 rounded-[20px] border border-line bg-card p-8"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Venture scalability report · sample</p>
            <p className="text-sm text-muted">Sample company</p>
            <p className="flex items-center gap-3 font-serif text-4xl leading-tight">
              <span className="text-accent">
                <CheckCircleIcon size={28} />
              </span>
              Highly Fundable
            </p>
            <p className="text-[15px]">
              Fits a venture profile at seed: the market, ownership and distribution signals are compatible
              with a fund-sized outcome, and there is operating evidence on the page.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="border-t border-line pt-2.5">
                <p className="text-[13px] font-semibold text-accent">Green flags</p>
                <p className="mt-1 text-sm">MoM growth of 18% is strong for this stage.</p>
              </div>
              <div className="border-t border-line pt-2.5">
                <p className="text-[13px] font-semibold text-danger">Red flags</p>
                <p className="mt-1 text-sm">No structural red flag fired from the intake.</p>
              </div>
            </div>
          </figure>
        </section>

        <section id="how" className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-24">
            <h2 className="font-serif text-4xl tracking-[-0.01em]">How it works</h2>
            <ol className="grid gap-8 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex flex-col gap-2.5 border-t border-ink pt-5">
                  <span className="font-serif text-xl text-accent">0{index + 1}</span>
                  <h3 className="font-serif text-[26px] leading-tight">{step.title}</h3>
                  <p className="text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="report" className="border-y border-line bg-card">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-24">
            <div className="flex max-w-2xl flex-col gap-3">
              <h2 className="font-serif text-4xl tracking-[-0.01em]">One of three plain answers</h2>
              <p className="text-lg text-muted">
                No “interesting, keep us posted”. Every report lands on a verdict and names the gaps behind it.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {VERDICTS.map(({ kicker, title, body, tone, Icon }) => (
                <div key={title} className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-7">
                  <p className={`flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] ${tone}`}>
                    <Icon size={22} />
                    {kicker}
                  </p>
                  <h3 className="font-serif text-[28px] leading-tight">{title}</h3>
                  <p className="text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-x-16 gap-y-12 px-6 py-24 sm:grid-cols-2">
          {BENEFITS.map((item) => (
            <div key={item.title} className="flex flex-col gap-2">
              <h3 className="font-serif text-2xl">{item.title}</h3>
              <p className="text-muted">{item.body}</p>
            </div>
          ))}
        </section>

        <section id="faq" className="border-t border-line">
          <div className="mx-auto flex max-w-3xl flex-col gap-2 px-6 py-24">
            <h2 className="mb-6 font-serif text-4xl">Questions</h2>
            {FAQ.map((item) => (
              <details key={item.q} className="border-b border-line py-5">
                <summary className="cursor-pointer text-lg">{item.q}</summary>
                <p className="mt-3 text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-ink text-paper">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-16">
            <h2 className="max-w-2xl font-serif text-4xl leading-tight">
              Find out what a partner would say before you pitch one.
            </h2>
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center rounded-full bg-paper px-6 text-[15px] text-ink"
            >
              Register
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-6 py-8 text-sm text-muted">
        <span>© {new Date().getFullYear()} RaiseOS</span>
      </footer>
    </div>
  );
}
