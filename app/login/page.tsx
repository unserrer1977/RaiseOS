import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Frame } from "@/components/frame";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <Frame>
      <AuthForm mode="login" error={params.error} />
      <p className="mx-auto mt-8 max-w-md text-sm text-muted">
        New here? <Link href="/register" className="text-ink">Register an email</Link>.
      </p>
    </Frame>
  );
}
