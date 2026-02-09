"use client";

import { useState } from "react";

import { supabase } from "@/lib/supabase/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import { toast } from "sonner";


export default function EditExpenseDialog({
  expense,
  onUpdated,
}: {
  expense: any;
  onUpdated: () => void;
}) {

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({

      title: expense.title || "",

      amount:
        expense.amount?.toString() || "",

      category:
        expense.category || "",

      date:
        expense.date ||
        new Date()
          .toISOString()
          .split("T")[0],

      notes:
        expense.notes || "",

    });



  async function updateExpense() {

    if (!form.title) {

      toast.error("Title required");

      return;

    }

    setLoading(true);

    const { error } =
      await supabase
        .from("expenses")
        .update({

          title: form.title,

          amount:
            Number(form.amount),

          category:
            form.category || null,

          date:
            form.date || null,

          notes:
            form.notes || null,

        })
        .eq("id", expense.id);

    setLoading(false);

    if (error) {

      toast.error(error.message);

      return;

    }

    toast.success("Expense updated");

    setOpen(false);

    onUpdated();

  }



  return (

    <Dialog
      open={open}
      onOpenChange={setOpen}
    >

      <DialogTrigger asChild>

        <Button
          size="sm"
          variant="outline"
        >

          Edit

        </Button>

      </DialogTrigger>



      <DialogContent>

        <DialogHeader>

          <DialogTitle>

            Edit Expense

          </DialogTitle>

        </DialogHeader>



        <div className="space-y-4">


          <div>

            <Label>Title</Label>

            <Input
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title:
                    e.target.value,
                })
              }
            />

          </div>



          <div>

            <Label>Amount</Label>

            <Input
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm({
                  ...form,
                  amount:
                    e.target.value,
                })
              }
            />

          </div>



          <div>

            <Label>Category</Label>

            <Input
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category:
                    e.target.value,
                })
              }
            />

          </div>



          <div>

            <Label>Date</Label>

            <Input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm({
                  ...form,
                  date:
                    e.target.value,
                })
              }
            />

          </div>



          <div>

            <Label>Notes</Label>

            <Textarea
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes:
                    e.target.value,
                })
              }
            />

          </div>



          <Button
            onClick={updateExpense}
            disabled={loading}
            className="w-full"
          >

            {loading
              ? "Updating..."
              : "Update Expense"}

          </Button>


        </div>

      </DialogContent>

    </Dialog>

  );

}
