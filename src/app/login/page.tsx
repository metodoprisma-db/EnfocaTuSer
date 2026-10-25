import type { Metadata } from "next";

import { AuthPage } from "@/components/auth/auth-page";
import { isRestrictedInternalPilot } from "@/lib/internal-access";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <AuthPage
      mode="login"
      initialError={params.error ?? ""}
      restrictedAccess={isRestrictedInternalPilot(process.env.ENFOCA_INTERNAL_ACCESS_MODE)}
    />
  );
}
