"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Allow login page
    if (pathname === "/login") {
      setChecking(false);
      return;
    }

    // Check initial auth state
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (
        session?.user?.email &&
        session.user.email.endsWith("@parapixel.net")
      ) {
        setIsAuth(true);
        setChecking(false);
      } else {
        setIsAuth(false);
        setChecking(false);
        router.push("/login");
      }
    };

    checkAuth();

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setIsAuth(false);
        router.push("/login");
      } else if (event === "SIGNED_IN" && session) {
        const email = session.user.email;
        if (email && email.endsWith("@parapixel.net")) {
          setIsAuth(true);
        } else {
          await supabase.auth.signOut();
          setIsAuth(false);
          router.push("/login");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  // Show nothing while checking auth on protected pages
  if (checking && pathname !== "/login") {
    return null;
  }

  // Don't show protected content if not authenticated
  if (!isAuth && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
}
