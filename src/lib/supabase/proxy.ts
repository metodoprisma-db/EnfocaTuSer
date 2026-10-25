import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { hasSupabaseEnvironment } from "@/lib/constants";
import {
  evaluateInternalAccess,
  isRestrictedInternalPilot,
  parseAllowedEmails,
} from "@/lib/internal-access";

const PUBLIC_ACCESS_PATHS = new Set([
  "/login",
  "/registro",
  "/auth/callback",
  "/admin/login",
]);

function redirectWithCookies(
  response: NextResponse,
  request: NextRequest,
  pathname: string,
  error?: string,
) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname;
  redirectUrl.search = "";
  if (error) redirectUrl.searchParams.set("error", error);
  const redirectResponse = NextResponse.redirect(redirectUrl);
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const restrictedAccess = isRestrictedInternalPilot(
    process.env.ENFOCA_INTERNAL_ACCESS_MODE,
  );
  const isPublicAccessPath = PUBLIC_ACCESS_PATHS.has(pathname);

  if (!hasSupabaseEnvironment) {
    if (restrictedAccess && !isPublicAccessPath) {
      return redirectWithCookies(
        response,
        request,
        "/login",
        "pilot_configuration",
      );
    }
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: authData, error } = await supabase.auth.getUser();
  const isProtectedAdminRoute =
    pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isProtectedAdminRoute && (error || !authData.user)) {
    return redirectWithCookies(response, request, "/admin/login");
  }

  if (restrictedAccess && !isPublicAccessPath) {
    const access = evaluateInternalAccess({
      restricted: true,
      allowedEmails: parseAllowedEmails(
        process.env.ENFOCA_INTERNAL_ALLOWED_EMAILS,
      ),
      userEmail: error ? null : authData.user?.email,
    });

    if (access !== "allowed") {
      const accessError = access === "configuration_error"
        ? "pilot_configuration"
        : access === "not_allowed"
          ? "pilot_not_authorized"
          : "session_required";
      return redirectWithCookies(response, request, "/login", accessError);
    }
  }

  return response;
}
