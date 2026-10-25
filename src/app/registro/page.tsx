import type { Metadata } from "next";

import { AuthPage } from "@/components/auth/auth-page";
import { isRestrictedInternalPilot } from "@/lib/internal-access";

export const metadata: Metadata = { title: "Crear acceso" };

export default function RegisterPage() {
  return (
    <AuthPage
      mode="register"
      restrictedAccess={isRestrictedInternalPilot(process.env.ENFOCA_INTERNAL_ACCESS_MODE)}
    />
  );
}
