import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { AngelUploader } from "@/components/angel-uploader";
import { CheckCircleIcon, MinusCircleIcon, WarningIcon } from "@/components/icons";
import { VerdictPill } from "@/components/verdict";
import { Wordmark } from "@/components/wordmark";
import { getSessionUser } from "@/lib/auth";
import { rowToAssessment } from "@/lib/assessments";
import type { Report } from "@/lib/types";

export const metadata: Metadata = {
  title: "Raise Insight for angels",
  description:
    "Upload a founder’s deck and get a plain read on whether the opportunity has the shape of a venture-scale return.",
};

const STEPS = [
  {
    title: "Share the deck",
    body: "Upload the PDF or PPTX the founder sent you, or paste a link. Raise Insight reads the slides and fills the assessment in the background.",
  },
  {
    title: "Answer only what the deck cannot",
    body: "If the venture story still has a gap, you will see at most four short questions — things only you would know from calls with the founder.",
  },
  {
    title: "Venture backable + founder questions",
    body: "A plain verdict on whether this can return like a venture bet, plus a copyable list of questions to ask the founders. Share it with a co-investor or save as PDF.",
  },
];

const VERDICTS = [
  {
    kicker: "Venture fit",
    title: "Worth a closer look",
    body: "No structural gaps, a market that can carry a large outcome, and traction on the page. Spend your diligence time here.",
    tone: "text-success",
    Icon: CheckCircleIcon,
  },
  {
    kicker: "One gap",
    title: "Proceed with care",
    body: "One structural gap, or a key number still missing. Get a good answer from the founder before you commit.",
    tone: "text-warn",
    Icon: MinusCircleIcon,
  },
  {
    kicker: "Two or more gaps",
    title: "Probably not a venture bet",
    body: "It may be a fine business, but it’s unlikely to return your cheque many times over. The report says why.",
    tone: "text-danger",
    Icon: WarningIcon,
  },
];

const BENEFITS = [
  {
    title: "Minutes, not evenings",
    body: "The deck does the reading. You only answer a few gaps if the venture story still breaks.",
  },
  {
    title: "Know what to ask",
    body: "Red flags name the exact gap: market size, go-to-market, cap table, unit economics, margins or traction. Take them into your next call.",
  },
  {
    title: "The same bar a fund uses",
    body: "The rules a seed partner applies, so you can see whether a deal could ever return like a venture investment.",
  },
  {
    title: "No account needed",
    body: "No sign-up and no password. Upload a deck and go. Share the finished report by private link.",
  },
];

const FAQ = [
  {
    q: "Do I need an account?",
    a: "No. Anyone can upload a deck or paste a link. Your assessments stay available in this browser so you can come back to them.",
  },
  {
    q: "Which files and links work?",
    a: "PDF or PPTX up to 50 MB, uploaded directly or from a link. Google Drive, Google Slides and Dropbox share links work if they are set to “anyone with the link”. Links behind a password, sign-in or email gate (DocSend, for example) can’t be read: download the deck and upload it instead.",
  },
  {
    q: "Is the founder’s deck kept private?",
    a: "Decks are kept in private storage and are not used to train a model. Share links show the finished report only, never the deck.",
  },
  {
    q: "Is this investment advice?",
    a: "No. It is a structured read of whether the business has the shape of a venture-scale return. Team, references, terms and your own judgement still decide the investment.",
  },
];

function formatUpdated(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default async function AngelPage() {
  await connection();
  const { supabase, user } = await getSessionUser();

  let rows: ReturnType<typeof rowToAssessment>[] = [];
  if (supabase && user) {
    const { data } = await supabase
      .from("assessments")
      .select("id, user_id, status, intake, report, deck_name, share_token, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20);
    rows = (data ?? []).map((row) => rowToAssessment(row));
  }

  return (
    <div className="min-h-full">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-7">
        <Wordmark href="/angel" suffix="For angels" />
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
          <a href="#start" className="font-medium text-ink">
            Assess a deck
          </a>
        </nav>
      </header>

      <main>
        <section id="start" className="mx-auto flex max-w-6xl flex-wrap items-start gap-16 px-6 pb-24 pt-12 sm:pt-16">
          <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-6">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted">For angel investors</p>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px]">
              Is this deal right for you? Get a partner’s read before you write the cheque.
            </h1>
            <p className="max-w-xl text-lg text-muted sm:text-[19px]">
              Upload the founder’s deck or paste a link. Raise Insight reads it, asks at most four gap questions where
              only you can fill in the story, then tells you whether it is venture backable and what to ask the founders.
            </p>
            <p className="text-sm text-muted">No account, no password. The deck stays in private storage and is not used to train a model.</p>
          </div>
          <div className="min-w-0 flex-[1_1_420px]">
            <AngelUploader />
          </div>
        </section>

        {rows.length > 0 ? (
          <section className="border-t border-line">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16">
              <h2 className="text-2xl font-semibold">Decks you’ve assessed</h2>
              <ul className="border-t border-line">
                {rows.map((row) => {
                  const href =
                    row.status === "complete"
                      ? `/angel/a/${row.id}/report`
                      : row.status === "followup"
                        ? `/angel/a/${row.id}/follow-up`
                        : `/angel/a/${row.id}`;
                  const companyName = row.intake.company.legalName.trim();
                  const title = companyName || row.deck_name || "Untitled deck";
                  const report = row.report as Report | null;
                  return (
                    <li key={row.id} className="border-b border-line">
                      <Link
                        href={href}
                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-4 text-ink"
                      >
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-base font-medium leading-tight">{title}</span>
                          <span className="text-[13px] text-muted">{formatUpdated(row.updated_at)}</span>
                        </span>
                        {report && row.status === "complete" ? (
                          <VerdictPill verdict={report.verdict} label={report.verdictLabel} />
                        ) : (
                          <span className="whitespace-nowrap rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted">
                            {row.status === "followup" ? "Quick questions" : "Reading deck"}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        ) : null}

        <section id="how" className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-24">
            <h2 className="text-3xl font-semibold tracking-[-0.02em]">How it works</h2>
            <ol className="grid gap-8 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex flex-col gap-2.5 border-t border-ink pt-5">
                  <span className="font-mono text-sm text-muted">0{index + 1}</span>
                  <h3 className="text-xl font-semibold leading-tight">{step.title}</h3>
                  <p className="text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="report" className="border-y border-line bg-card">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-24">
            <div className="flex max-w-2xl flex-col gap-3">
              <h2 className="text-3xl font-semibold tracking-[-0.02em]">One of three plain answers</h2>
              <p className="text-lg text-muted">
                No “interesting, let’s see”. Every report lands on a verdict, names the gaps behind it and says
                what it means for your decision.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {VERDICTS.map(({ kicker, title, body, tone, Icon }) => (
                <div key={title} className="flex flex-col gap-3 rounded-lg border border-line bg-paper p-7">
                  <p className={`flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] ${tone}`}>
                    <Icon size={22} />
                    {kicker}
                  </p>
                  <h3 className="text-xl font-semibold leading-tight">{title}</h3>
                  <p className="text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-x-16 gap-y-12 px-6 py-24 sm:grid-cols-2">
          {BENEFITS.map((item) => (
            <div key={item.title} className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-muted">{item.body}</p>
            </div>
          ))}
        </section>

        <section id="faq" className="border-t border-line">
          <div className="mx-auto flex max-w-3xl flex-col gap-2 px-6 py-24">
            <h2 className="mb-6 text-3xl font-semibold tracking-[-0.02em]">Questions</h2>
            {FAQ.map((item) => (
              <details key={item.q} className="border-b border-line py-5">
                <summary className="cursor-pointer text-lg">{item.q}</summary>
                <p className="mt-3 text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-ink text-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-16">
            <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.02em] leading-tight">
              Know what a partner would say before you invest.
            </h2>
            <a
              href="#start"
              className="inline-flex min-h-12 items-center rounded-md bg-accent px-6 text-[15px] font-medium text-ink"
            >
              Assess a deck
            </a>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-6 py-8 text-sm text-muted">
        <span>© {new Date().getFullYear()} Raise Insight by Angel OS</span>
        <span>A structured read of the deck, not investment advice.</span>
      </footer>
    </div>
  );
}
