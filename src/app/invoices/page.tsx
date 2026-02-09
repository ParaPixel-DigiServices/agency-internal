"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import { Skeleton } from "@/components/ui/skeleton";

import { Invoice } from "@/types/invoice";

import AddInvoiceDialog from "@/components/invoice/AddInvoiceDialog";

import InvoiceStatusSelect from "@/components/invoice/InvoiceStatusSelect";

import ExportInvoiceButton from "@/components/invoice/ExportInvoiceButton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


export default function InvoicesPage() {

  const [invoices, setInvoices] =
    useState<Invoice[]>([]);

  const [loading, setLoading] =
    useState(true);



  /* ===============================
     ROW COLOR
  =============================== */

  function getRowColor(status?: string) {

    if (!status) return "";

    if (status === "Paid")
      return "bg-green-50 border-l-4 border-green-500";

    if (status === "Overdue")
      return "bg-red-50 border-l-4 border-red-500";

    if (status === "Sent" || status === "Draft")
      return "bg-yellow-50 border-l-4 border-yellow-500";

    if (status === "Cancelled")
      return "bg-gray-50 border-l-4 border-gray-400";

    return "";

  }



  /* ===============================
     FETCH INVOICES
  =============================== */

  async function fetchInvoices() {

    try {

      setLoading(true);

      const today =
        new Date()
          .toISOString()
          .split("T")[0];


      /* auto mark overdue */

      await supabase
        .from("invoices")
        .update({
          status: "Overdue",
        })
        .not("due_date", "is", null)
        .lt("due_date", today)
        .neq("status", "Paid")
        .neq("status", "Cancelled");


      /* fetch invoices */

      const { data, error } =
        await supabase
          .from("invoices")
          .select(`
            *,
            clients(name),
            projects(name)
          `)
          .order("created_at", {
            ascending: false,
          });


      if (error) {

        console.error(error);

        return;

      }


      setInvoices(data || []);

    }

    catch (error) {

      console.error(error);

    }

    finally {

      setLoading(false);

    }

  }



  useEffect(() => {

    fetchInvoices();

  }, []);



  /* ===============================
     LOADING STATE
  =============================== */

  if (loading) {

    return (

      <div className="p-8">

        <div className="flex justify-between mb-6">

          <Skeleton className="h-8 w-32" />

          <Skeleton className="h-10 w-36" />

        </div>


        <div className="space-y-3">

          <div className="flex gap-4 border-b pb-2">

            {[...Array(7)].map((_, i) => (

              <Skeleton
                key={i}
                className="h-5 w-24"
              />

            ))}

          </div>


          {[...Array(8)].map((_, i) => (

            <Skeleton
              key={i}
              className="h-16 w-full"
            />

          ))}

        </div>

      </div>

    );

  }



  /* ===============================
     UI
  =============================== */

  return (

    <div className="p-8">

      {/* Header */}

      <div className="flex justify-between mb-6">

        <h1 className="text-2xl font-bold">

          Invoices

        </h1>

        <AddInvoiceDialog
          onAdded={fetchInvoices}
        />

      </div>



      {/* Table */}

      <Table>

        <TableHeader>

          <TableRow>

            <TableHead>
              Invoice #
            </TableHead>

            <TableHead>
              Client
            </TableHead>

            <TableHead>
              Project
            </TableHead>

            <TableHead>
              Amount
            </TableHead>

            <TableHead>
              Issue Date
            </TableHead>

            <TableHead>
              Due Date
            </TableHead>

            <TableHead>
              Status
            </TableHead>

            <TableHead>
              Export
            </TableHead>

          </TableRow>

        </TableHeader>



        <TableBody>

          {invoices.length === 0 && (

            <TableRow>

              <TableCell colSpan={8}>

                No invoices found.

              </TableCell>

            </TableRow>

          )}



          {invoices.map((invoice) => (

            <TableRow
              key={invoice.id}
              className={getRowColor(invoice.status)}
            >

              <TableCell>

                {invoice.invoice_number}

              </TableCell>


              <TableCell>

                {invoice.clients?.name || "-"}

              </TableCell>


              <TableCell>

                {invoice.projects?.name || "-"}

              </TableCell>


              <TableCell>

                ₹{Number(invoice.total).toLocaleString()}

              </TableCell>


              <TableCell>

                {invoice.issue_date || "-"}

              </TableCell>


              <TableCell>

                {invoice.due_date || "-"}

              </TableCell>


              <TableCell>

                <InvoiceStatusSelect

                  invoice={invoice}

                  onUpdated={fetchInvoices}

                />

              </TableCell>


              <TableCell>

                {/* FIXED */}

                <ExportInvoiceButton
                  invoiceId={invoice.id}
                  invoiceNumber={invoice.invoice_number}
                />

              </TableCell>


            </TableRow>

          ))}

        </TableBody>

      </Table>

    </div>

  );

}
