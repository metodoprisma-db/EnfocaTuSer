import { AppShell } from "@/components/layout/app-shell";
import { AppStateProvider } from "@/context/app-state";
import { unlockIntervalForEnvironment } from "@/lib/progression";

export default function ApplicationLayout({ children }: { children: React.ReactNode }) {
  const unlockIntervalMs = unlockIntervalForEnvironment(
    process.env.NODE_ENV,
    process.env.VERCEL_ENV,
  );

  return (
    <AppStateProvider unlockIntervalMs={unlockIntervalMs}>
      <AppShell>{children}</AppShell>
    </AppStateProvider>
  );
}
