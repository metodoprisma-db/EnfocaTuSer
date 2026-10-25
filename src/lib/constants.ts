export const ASSETS = {
  logo:
    "/logo-enfoca-tu-ser.png",
  mark:
    "/isotipo-enfoca-tu-ser.png",
  butterfly:
    "/icon-butterfly.png",
  favicon:
    "/icon-250.png",
  mentors:
    "/clarissa-scarlett-mentoras.png",
  clarissa:
    "https://d1yei2z3i6k35z.cloudfront.net/16481184/6a511e9b48cc47.40674928_WhatsAppImage2026-05-27at10.33.37PM3.jpeg",
} as const;

export const LOCAL_STORAGE_KEY = "enfoca-tu-ser:v2";
export const LEGACY_LOCAL_STORAGE_KEY = "enfoca-tu-ser:v1";
export const TIMEZONE_PROMPT_STORAGE_KEY =
  "enfoca-tu-ser:timezone-do-not-ask";
export const JOURNAL_PAGE_SIZE = 20;

export const GIFT_CHAT_URL =
  process.env.NEXT_PUBLIC_GIFT_CHAT_URL?.trim() ||
  "https://calendly.com/enfoca-tu-ser/charla-cercana";

export const SUPPORT_URL =
  process.env.NEXT_PUBLIC_SUPPORT_URL?.trim() || GIFT_CHAT_URL;

export const MEMBERSHIP_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_MEMBERSHIP_CHECKOUT_URL?.trim() || SUPPORT_URL;

export const ENFORCE_SUBSCRIPTION =
  process.env.NEXT_PUBLIC_ENFORCE_SUBSCRIPTION === "true";

export const hasSupabaseEnvironment = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
);
