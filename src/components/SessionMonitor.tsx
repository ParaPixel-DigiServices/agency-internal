"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

// Session timeout configuration
// Note: NODE_ENV is set by Next.js framework (npm run dev = development, npm run build + npm start = production)
// To force production timeout in development, set NEXT_PUBLIC_FORCE_PRODUCTION_TIMEOUT=true in .env
const SESSION_TIMEOUT =
  process.env.NEXT_PUBLIC_FORCE_PRODUCTION_TIMEOUT === "true"
    ? 8 * 60 * 60 * 1000 // 8 hours
    : process.env.NODE_ENV === "production"
      ? 8 * 60 * 60 * 1000 // 8 hours for production
      : 30 * 60 * 1000; // 30 minutes for development

const WARNING_BEFORE_TIMEOUT = 2 * 60 * 1000; // 2 minutes warning

export default function SessionMonitor({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    let warningShown = false;
    let sessionStartTime = Date.now();
    let logoutTriggered = false; // Track if logout has already been triggered

    // Reset session start time on user activity
    const resetSessionTimer = () => {
      sessionStartTime = Date.now();
      warningShown = false;
    };

    // Check session validity every 30 seconds
    checkInterval = setInterval(async () => {
      // Stop checking if logout already triggered
      if (logoutTriggered) {
        clearInterval(checkInterval);
        return;
      }

      const elapsed = Date.now() - sessionStartTime;

      // Show warning 30 seconds before timeout
      if (
        elapsed >= SESSION_TIMEOUT - WARNING_BEFORE_TIMEOUT &&
        !warningShown
      ) {
        toast.warning(
          "Your session will expire soon. Activity will refresh your session.",
        );
        warningShown = true;
      }

      // Force logout if timeout exceeded
      if (elapsed >= SESSION_TIMEOUT) {
        logoutTriggered = true;
        clearInterval(checkInterval);
        toast.error("Session expired. Please log in again.");
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }

      // Also check with Supabase if session is still valid
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        logoutTriggered = true;
        clearInterval(checkInterval);
        toast.error("Session expired. Please log in again.");
        router.push("/login");
      }
    }, 30000); // Check every 30 seconds

    // Listen for user activity to reset timer
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, resetSessionTimer);
    });

    // Clean up
    return () => {
      clearInterval(checkInterval);
      events.forEach((event) => {
        window.removeEventListener(event, resetSessionTimer);
      });
    };
  }, [router]);

  return <>{children}</>;
}
