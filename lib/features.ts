// Accounts (sign-up, sign-in and the founder pages) are switched off for now.
// Everyone uses the public deck flow at /angel: upload a deck or paste a link,
// get the report. Set this to true to bring the founder accounts back.
export const ACCOUNTS_ENABLED = false;

/** Account-only paths. While accounts are off they redirect to the public flow. */
export function isAccountPath(path: string) {
  return (
    path === "/" ||
    path === "/login" ||
    path === "/register" ||
    path.startsWith("/home") ||
    path.startsWith("/a/") ||
    path.startsWith("/api/ingest") ||
    path.startsWith("/auth/callback")
  );
}
