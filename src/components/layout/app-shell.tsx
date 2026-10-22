"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookHeart,
  CircleUserRound,
  Compass,
  Footprints,
  HeartHandshake,
  Home,
  LogIn,
  Sparkles,
} from "lucide-react";

import { useAppState } from "@/context/app-state";
import { ASSETS } from "@/lib/constants";
import { MembershipTransition } from "@/components/membership-transition";
import { ProfileSettings } from "@/components/profile-settings";

const primaryNav = [
  { href: "/", label: "Mi espacio", icon: Home },
  { href: "/camino", label: "Mi camino", icon: Footprints },
  { href: "/soltar", label: "Soltar ahora", icon: Sparkles },
  { href: "/diario", label: "Mi diario", icon: BookHeart },
  { href: "/brujula", label: "Brújula", icon: Compass },
];

function NavLink({ href, label, icon: Icon }: (typeof primaryNav)[number]) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link className={`nav-link${active ? " active" : ""}`} href={href} aria-current={active ? "page" : undefined}>
      <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, meta } = useAppState();
  const percentage = Math.round((meta.stats.discoveriesCompleted / 15) * 100);
  const statusCopy = {
    local: "Guardado en este dispositivo",
    pending: "Guardado aquí, falta sincronizar",
    connecting: "Sincronizando",
    synced: "Progreso sincronizado",
    error: "No pudimos confirmar el guardado",
  }[state.syncStatus];

  if (!state.hydrated) {
    return (
      <div className="loading-screen">
        <div>
          <div className="loading-mark" />
          <p>Preparando tu espacio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Link href="/" className="brand-link" aria-label="Enfoca Tu Ser, ir al inicio">
          <Image src={ASSETS.logo} width={420} height={130} alt="Enfoca Tu Ser" priority />
        </Link>

        <div className="sidebar-progress">
          <span className="eyebrow eyebrow-light">Tu camino</span>
          <p style={{ marginBottom: 10, fontSize: ".88rem" }}>
            {meta.stats.discoveriesCompleted} de 15 descubrimientos
          </p>
          <div className="progress-track" aria-label={`${percentage}% del camino recorrido`}>
            <div className="progress-fill" style={{ width: `${percentage}%` }} />
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          {primaryNav.map((item) => <NavLink key={item.href} {...item} />)}
          <NavLink href="/sobre" label="Sobre este camino" icon={HeartHandshake} />
        </nav>

        <div className="mentor-mini">
          <div className="mentor-avatar">
            <Image src={ASSETS.mentors} width={108} height={108} alt="Clarissa Acevedo y Scarlett Vargas" />
          </div>
          <div>
            <strong>Estamos cerquita</strong>
            <span>Clarissa y Scarlett te acompañan.</span>
          </div>
        </div>
      </aside>

      <main className="app-main">
        <div className="topbar">
          <Link className="mobile-brand" href="/" aria-label="Enfoca Tu Ser, ir al inicio">
            <Image src={ASSETS.mark} width={48} height={48} alt="" />
          </Link>
          <span className="sync-pill">
            <span className={`sync-dot ${state.syncStatus}`} />
            {statusCopy}
          </span>
          <ProfileSettings />
          {state.user ? (
            <span className="auth-link"><CircleUserRound size={17} /> {state.user.email}</span>
          ) : (
            <Link className="auth-link" href="/login"><LogIn size={17} /> Sincronizar</Link>
          )}
        </div>
        {meta.accessExpired ? <MembershipTransition /> : children}
      </main>

      <nav className="mobile-nav" aria-label="Navegación móvil">
        {primaryNav.map((item) => <NavLink key={item.href} {...item} />)}
      </nav>
    </div>
  );
}
