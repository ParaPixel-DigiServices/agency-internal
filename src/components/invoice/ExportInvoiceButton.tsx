"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { Download, Loader2 } from "lucide-react";

import { toast } from "sonner";


export default function ExportInvoiceButton({
  invoiceId,
  invoiceNumber,
}: {
  invoiceId: string;
  invoiceNumber: string;
}) {

  const [loading, setLoading] =
    useState(false);


  async function exportPDF() {

    try {

      setLoading(true);

      const res =
        await fetch(
          "/api/invoice/export",
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

            },

            body:
              JSON.stringify({
                invoiceId
              }),

          }
        );


      if (!res.ok) {

        const text =
          await res.text();

        console.error(
          "Export failed:",
          text
        );

        toast.error(
          "Failed to export invoice"
        );

        return;

      }


      const blob =
        await res.blob();


      const url =
        window.URL.createObjectURL(blob);


      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `${invoiceNumber}.pdf`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);


      window.URL.revokeObjectURL(url);


      toast.success(
        "Invoice exported"
      );

    }

    catch (error) {

      console.error(
        "Export error:",
        error
      );

      toast.error(
        "Export failed"
      );

    }

    finally {

      setLoading(false);

    }

  }


  return (

    <Button
      size="sm"
      variant="outline"
      onClick={exportPDF}
      disabled={loading}
    >

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
