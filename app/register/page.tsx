import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Frame } from "@/components/frame";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; check?: string }>;
}) {
  const params = await searchParams;
  return (
    <Frame>
      <AuthForm mode="register" error={params.error} checkEmail={params.check === "1"} />
      <p className="mx-auto mt-8 max-w-md text-sm text-muted">
        Already registered? <Link href="/login" className="text-ink">Sign in</Link>.
      </p>
    </Frame>
  );
}
