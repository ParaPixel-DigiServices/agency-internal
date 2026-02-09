"use client";

import { useState, useEffect } from "react";
import { signInWithGoogle } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let isSigningOut = false;

    // Listen to Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const email = session.user.email;

        // Check if email is from parapixel.net domain
        if (email && email.endsWith("@parapixel.net")) {
          window.location.href = "/dashboard";
        } else {
          // Mark that we're signing out to preserve error state
          isSigningOut = true;
          setError("Access denied. Only @parapixel.net emails are allowed.");
          // Sign out the user
          await supabase.auth.signOut();
          setLoading(false);
        }
      } else if (event === "SIGNED_OUT" && !isSigningOut) {
        // Only reset loading if we're not in the middle of signing out for unauthorized domain
        setLoading(false);
      }
    });

    // Handle error query parameters
    const errorParam = searchParams.get("error");
    if (errorParam === "unauthorized_domain") {
      setError("Access denied. Only @parapixel.net emails are allowed.");
    } else if (errorParam === "auth_failed") {
      setError("Authentication failed. Please try again.");
    } else if (errorParam) {
      setError(`Error: ${errorParam}`);
    }

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams, router]);

  async function handleGoogleSignIn() {
    setLoading(true);
    setError("");

    const result = await signInWithGoogle();

    if (!result.success) {
      setError(result.error || "Failed to sign in with Google");
      setLoading(false);
    }
    // If successful, user will be redirected by OAuth flow
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-4 flex flex-col items-center pb-4">
          <Image
            src="/logo.svg"
            alt="ParaPixel Logo"
            width={80}
            height={80}
            className="mb-2 invert"
          />
          <h1 className="text-2xl font-bold text-center">ParaPixel Internal</h1>
          <p className="text-sm text-muted-foreground text-center">
            Sign in with your @parapixel.net Google account
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm text-center p-3 bg-red-50 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            className="w-full"
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              "Redirecting to Google..."
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </div>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Only accounts with @parapixel.net email addresses can access this
            system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
