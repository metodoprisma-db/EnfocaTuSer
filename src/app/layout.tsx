import type { Metadata, Viewport } from "next";
import { Alice, Cabin, Montserrat } from "next/font/google";

import { ASSETS } from "@/lib/constants";

import "./globals.css";

const alice = Alice({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alice",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const cabin = Cabin({
  subsets: ["latin"],
  variable: "--font-cabin",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Enfoca Tu Ser",
    template: "%s | Enfoca Tu Ser",
  },
  description:
    "Un espacio cálido para soltar peso emocional, escucharte y volver a tu centro junto a Clarissa Acevedo y Scarlett Vargas.",
  icons: {
    icon: ASSETS.favicon,
    shortcut: ASSETS.favicon,
    apple: ASSETS.favicon,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Enfoca Tu Ser",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#016DBF",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${alice.variable} ${montserrat.variable} ${cabin.variable}`}>
      <body>{children}</body>
    </html>
  );
}
