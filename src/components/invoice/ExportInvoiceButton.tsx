"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { Download, Loader2 } from "lucide-react";


export default function ExportInvoiceButton({
  invoice,
}: {
  invoice: any;
}) {

  const [loading, setLoading] =
    useState(false);



  const exportPDF = async () => {

    try {

      setLoading(true);


      const res = await fetch(
        "/api/invoice/export",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            invoiceId: invoice.id,
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

        alert(
          "Failed to export invoice"
        );

        return;

      }


      const blob =
        await res.blob();


      const url =
        window.URL.createObjectURL(
          blob
        );


      const a =
        document.createElement("a");

      a.href = url;

      a.download =
        `${invoice.invoice_number}.pdf`;

      document.body.appendChild(a);

      a.click();

      a.remove();


      // cleanup memory
      window.URL.revokeObjectURL(
        url
      );

    }

    catch (error) {

      console.error(
        "Export error:",
        error
      );

      alert(
        "Unexpected error exporting invoice"
      );

    }

    finally {

      setLoading(false);

    }

  };



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
          Exporting
        </>

      ) : (

        <>
          <Download className="w-4 h-4 mr-2" />
          Export
        </>

      )}

    </Button>

  );

}
