import { AlertCircleIcon, GoogleMarkIcon, MailIcon } from "@/components/icons";
import { signIn, signInWithGoogle, signUp } from "@/lib/actions";

const inputClass =
  "h-11 w-full rounded-md border border-line-strong bg-card px-3 text-base text-ink shadow-sm outline-none focus:border-ink focus:ring-2 focus:ring-accent/50";

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
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </p>
        <h1 className="text-3xl font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-4xl">
          {mode === "login" ? "Sign in with your email." : "Register an email to keep this work."}
        </h1>
        <p className="text-muted">
          Assessments stay on this account. You can leave and pick up the same report later.
        </p>
      </div>

      {checkEmail ? (
        <p
          className="flex items-start gap-2.5 rounded-md border border-success/30 bg-success-tint px-3.5 py-3 text-sm text-success"
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
          className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger-tint/50 px-3.5 py-3 text-sm text-danger"
          role="alert"
        >
          <span className="mt-0.5 shrink-0">
            <AlertCircleIcon />
          </span>
          {error}
        </p>
      ) : null}

      <form action={action} className="flex flex-col gap-6">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
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
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
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
        <button type="submit" className="min-h-12 w-full rounded-md font-medium bg-ink px-5 text-[15px] text-white">
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
          className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-md font-medium border border-line-strong px-5 text-[15px] text-ink"
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
