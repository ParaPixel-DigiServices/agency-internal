"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { Download, Loader2 } from "lucide-react";

import { toast } from "sonner";

import { supabase } from "@/lib/supabase/client";

export default function ExportInvoiceButton({
  invoiceId,
  invoiceNumber,
}: {
  invoiceId: string;
  invoiceNumber: string;
}) {
  const [loading, setLoading] = useState(false);

  async function exportPDF() {
    try {
      setLoading(true);

      // Get current session token
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        toast.error("Authentication required. Please log in again.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/invoice/export", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${session.access_token}`,
        },

        body: JSON.stringify({
          invoiceId,
        }),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          toast.error("Authentication failed. Please log in again.");
          // Optionally redirect to login
          // window.location.href = "/login";
          return;
        }

        const text = await res.text();

        if (process.env.NODE_ENV === "development") {
          console.error("Export failed:", text);
        }

        toast.error("Failed to export invoice");

        return;
      }

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `${invoiceNumber}.pdf`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      toast.success("Invoice exported");
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Export error:", error);
      }

      toast.error("Export failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={exportPDF} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </>
      )}
    </Button>
  );
}
