"use client";

import { supabase } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";

import { toast } from "sonner";


export default function DeleteExpenseButton({
  expenseId,
  onDeleted,
}: {
  expenseId: string;
  onDeleted: () => void;
}) {

  async function deleteExpense() {

    if (
      !confirm(
        "Delete this expense?"
      )
    )
      return;

    const { error } =
      await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

    if (error) {

      toast.error(error.message);

      return;

    }

    toast.success(
      "Expense deleted"
    );

    onDeleted();

  }



  return (

    <Button
      size="sm"
      variant="destructive"
      onClick={deleteExpense}
    >

      Delete

    </Button>

  );

}
