import { AppShell } from "@/components/layout/app-shell";
import { AppStateProvider } from "@/context/app-state";

export default function ApplicationLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppStateProvider>
      <AppShell>{children}</AppShell>
    </AppStateProvider>
  );
}
