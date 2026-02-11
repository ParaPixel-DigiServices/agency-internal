"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { supabase } from "@/lib/supabase/client";

import { Invoice } from "@/types/invoice";

import { toast } from "sonner";

export default function InvoiceStatusSelect({
  invoice,
  onUpdated,
}: {
  invoice: Invoice;
  onUpdated: () => Promise<void>;
}) {
  const updateStatus = async (status: string) => {
    try {
      // Prevent unnecessary update
      if (status === invoice.status) return;

      const { error } = await supabase
        .from("invoices")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoice.id);

      if (error) {
        if (process.env.NODE_ENV === "development") {
          console.error(error);
        }

        toast.error("Failed to update invoice status");

        return;
      }

      // DO NOT create payment here
      // Database trigger handles it automatically

      toast.success(`Invoice marked as ${status}`);

      // Refresh invoice list
      await onUpdated();
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }

      toast.error("Something went wrong");
    }
  };

  return (
    <Select value={invoice.status ?? "Draft"} onValueChange={updateStatus}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="Draft">Draft</SelectItem>

        <SelectItem value="Sent">Sent</SelectItem>

        <SelectItem value="Paid">Paid</SelectItem>

        <SelectItem value="Overdue">Overdue</SelectItem>

        <SelectItem value="Cancelled">Cancelled</SelectItem>
      </SelectContent>
    </Select>
  );
}
