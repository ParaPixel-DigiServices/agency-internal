"use client";

import "./globals.css";
import { usePathname } from "next/navigation";

import Sidebar from "@/components/layouts/Sidebar";
import AuthGuard from "@/components/AuthGuard";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <div className="flex">
      <Sidebar />
      <main className={isLoginPage ? "flex-1" : "flex-1 ml-64"}>
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>ParaPixel Admin Dashboard</title>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body>
        <AuthGuard>
          <LayoutContent>{children}</LayoutContent>
        </AuthGuard>
      </body>
    </html>
  );
}
