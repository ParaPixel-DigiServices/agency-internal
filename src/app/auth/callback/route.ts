import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${error}`, requestUrl.origin),
    );
  }

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError && data.session) {
      const email = data.session.user.email;

      // Verify email domain
      if (email && email.endsWith("@parapixel.net")) {
        // Redirect to dashboard on success
        return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
      } else {
        // Sign out and redirect to login with error
        await supabase.auth.signOut();
        return NextResponse.redirect(
          new URL("/login?error=unauthorized_domain", requestUrl.origin),
        );
      }
    }
  }

  // Redirect to login with error
  return NextResponse.redirect(
    new URL("/login?error=auth_failed", requestUrl.origin),
  );
}
