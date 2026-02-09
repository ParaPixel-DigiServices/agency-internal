"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CreditCard,
  Receipt,
  FileText,
} from "lucide-react"

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

]

export default function Sidebar() {

  const pathname = usePathname()

  return (
    <div className="w-64 h-screen border-r bg-background p-4">

      <div className="text-xl font-bold mb-8">
        ParaPixel OS
      </div>

      <nav className="space-y-2">

        {navItems.map((item) => {

          const Icon = item.icon

          const active = pathname === item.href

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
          )
        })}

      </nav>

    </div>
  )
}
