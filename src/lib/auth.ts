import { supabase } from "./supabase/client";

export async function isAuthenticated(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return false;

    // Check if email is from @parapixel.net domain
    const email = session.user.email;
    if (!email || !email.endsWith("@parapixel.net")) {
      // Sign out if not from allowed domain
      await supabase.auth.signOut();
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

export async function signInWithGoogle(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/login`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to initiate Google sign-in" };
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user || null;
}
