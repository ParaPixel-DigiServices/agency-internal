"use client";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export default function HomePage() {

  const sections = [

    {
      title: "Dashboard",
      description:
        "Financial overview, charts, and business metrics",
      href: "/dashboard",
    },

    {
      title: "Clients",
      description:
        "Manage all clients and view their profiles",
      href: "/clients",
    },

    {
      title: "Projects",
      description:
        "Track active, completed, and upcoming projects",
      href: "/projects",
    },

    {
      title: "Invoices",
      description:
        "Create invoices, export PDFs, and track payments",
      href: "/invoices",
    },

    {
      title: "Payments",
      description:
        "View all incoming payments and revenue flow",
      href: "/payments",
    },

    {
      title: "Expenses",
      description:
        "Track expenses and monitor profit",
      href: "/expenses",
    },

  ];

  return (

    <div className="p-8 max-w-7xl mx-auto">

      {/* Header */}

      <div className="flex justify-between items-center mb-10">

        <div>

          <h1 className="text-4xl font-bold">
            ParaPixel Internal Tool
          </h1>

          <p className="text-muted-foreground mt-1">
            Control center for clients, projects, and finances
          </p>

        </div>

      </div>


      {/* Grid */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {sections.map((section) => (

          <Card key={section.href}>

            <CardHeader>

              <CardTitle>
                {section.title}
              </CardTitle>

            </CardHeader>

            <CardContent>

              <p className="text-sm text-muted-foreground mb-4">
                {section.description}
              </p>

              <Link href={section.href}>

                <Button className="w-full">
                  Open
                </Button>

              </Link>

            </CardContent>

          </Card>

        ))}

      </div>


      {/* Footer */}

      <div className="mt-16 text-center text-sm text-muted-foreground">

        ParaPixel DigiServices Internal System  
        <br />
        v2.0

      </div>

    </div>

  );

}
