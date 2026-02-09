"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CreditCard,
  Receipt,
  FileText,
} from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    name: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: Receipt,
  },
  {
    name: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  if (!isAuthenticated()) return null;

  return (
    <div className="fixed left-0 top-0 w-64 h-screen border-r bg-background p-4 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <Image
          src="/logo.svg"
          alt="ParaPixel Logo"
          width={40}
          height={40}
          className="rounded invert"
        />
        <div className="text-xl font-bold">ParaPixel OS</div>
      </div>

      <nav className="space-y-2 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg
                hover:bg-muted transition
                ${active ? "bg-muted font-medium" : ""}
              `}
            >
              <Icon size={18} />

              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t">
        <LogoutButton />
      </div>
    </div>
  );
}
