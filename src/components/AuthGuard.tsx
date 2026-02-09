"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {

    // allow login page
    if (pathname === "/login") return;

    if (!isAuthenticated()) {
      router.push("/login");
    }

  }, [pathname]);

  return <>{children}</>;

}
