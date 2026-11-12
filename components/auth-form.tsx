import { signIn, signInWithGoogle, signUp } from "@/lib/actions";

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
    <div className="mx-auto w-full max-w-md">
      <p className="text-sm uppercase tracking-[0.16em] text-muted">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </p>
      <h1 className="mt-3 font-serif text-4xl text-ink">
        {mode === "login" ? "Sign in with your email." : "Register an email to keep this work."}
      </h1>
      <p className="mt-4 text-muted">
        Assessments stay on this account. You can leave and pick up the same report later.
      </p>

      {checkEmail ? (
        <p className="mt-6 rounded-md border border-line bg-card px-4 py-3 text-sm" role="status">
          Check your inbox to confirm the address, then sign in.
        </p>
      ) : null}
      {error ? (
        <p className="mt-6 rounded-md border border-danger/30 bg-card px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <form action={action} className="mt-8 space-y-5">
        <label className="block text-sm text-muted">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 w-full border-b border-line bg-transparent py-3 text-lg text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm text-muted">
          Password
          <input
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={8}
            className="mt-2 w-full border-b border-line bg-transparent py-3 text-lg text-ink outline-none focus:border-accent"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-ink px-5 py-3 text-sm text-paper"
        >
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <form action={signInWithGoogle} className="mt-3">
        <button
          type="submit"
          className="w-full rounded-full border border-line px-5 py-3 text-sm text-ink"
        >
          Continue with Google
        </button>
      </form>
    </div>
  );
}
