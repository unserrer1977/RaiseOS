import { AlertCircleIcon, GoogleMarkIcon, MailIcon } from "@/components/icons";
import { signIn, signInWithGoogle, signUp } from "@/lib/actions";

const inputClass =
  "w-full border-0 border-b border-ink bg-transparent py-3 text-lg text-ink outline-none focus:border-accent";

export function AuthForm({
  mode,
  error,
  checkEmail,
}: {
  mode: "login" | "register";
  error?: string;
  checkEmail?: boolean;
}) {
  const action = mode === "login" ? signIn : signUp;
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-[13px] uppercase tracking-[0.16em] text-muted">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </p>
        <h1 className="font-serif text-4xl leading-tight text-ink sm:text-[40px]">
          {mode === "login" ? "Sign in with your email." : "Register an email to keep this work."}
        </h1>
        <p className="text-muted">
          Assessments stay on this account. You can leave and pick up the same report later.
        </p>
      </div>

      {checkEmail ? (
        <p
          className="flex items-start gap-2.5 rounded-xl border border-accent/30 bg-accent-tint px-3.5 py-3 text-sm text-accent"
          role="status"
        >
          <span className="mt-0.5 shrink-0">
            <MailIcon />
          </span>
          Check your inbox to confirm the address, then sign in.
        </p>
      ) : null}
      {error ? (
        <p
          className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger-tint/50 px-3.5 py-3 text-sm text-danger"
          role="alert"
        >
          <span className="mt-0.5 shrink-0">
            <AlertCircleIcon />
          </span>
          {error}
        </p>
      ) : null}

      <form action={action} className="flex flex-col gap-6">
        <label className="flex flex-col gap-1 text-sm text-muted">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          Password
          <input
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={8}
            aria-describedby={mode === "register" ? "password-hint" : undefined}
            className={inputClass}
          />
          {mode === "register" ? (
            <span id="password-hint" className="text-[13px]">
              At least 8 characters.
            </span>
          ) : null}
        </label>
        <button type="submit" className="min-h-12 w-full rounded-full bg-ink px-5 text-[15px] text-paper">
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-[13px] text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full border border-line-strong px-5 text-[15px] text-ink"
        >
          <GoogleMarkIcon />
          Continue with Google
        </button>
      </form>

      {mode === "register" ? (
        <p className="text-[13px] text-muted">
          Your deck stays in private storage and is not used to train a model.
        </p>
      ) : null}
    </div>
  );
}
