import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { hasSupabaseEnvironment } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Panel de administración" };

export default async function AdminPage() {
  if (!hasSupabaseEnvironment) {
    return (
      <main className="admin-config-state">
        <h1>Administración pendiente de conexión</h1>
        <p>Configura las variables públicas de Supabase para habilitar este panel.</p>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login");

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profile?.role !== "admin") redirect("/admin/login?error=forbidden");
  return <AdminDashboard />;
}
