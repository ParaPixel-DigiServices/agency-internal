"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import AddExpenseDialog from "@/components/expenses/AddExpenseDialog";
import EditExpenseDialog from "@/components/expenses/EditExpensesDialog";
import DeleteExpenseButton from "@/components/expenses/DeleteExpenseButton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { toast } from "sonner";


export default function ExpensesPage() {

  const [expenses, setExpenses] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [total, setTotal] =
    useState(0);



  /* =====================================
     FETCH EXPENSES
  ===================================== */

  async function fetchExpenses() {

    try {

      setLoading(true);

      const { data, error } =
        await supabase
          .from("expenses")
          .select(`
            *,
            projects(name)
          `)
          .order("date", {
            ascending: false,
          });

      if (error) {

        toast.error(error.message);

        return;

      }

      setExpenses(data || []);

      const totalAmount =
        data?.reduce(
          (sum, exp) =>
            sum + Number(exp.amount),
          0
        ) || 0;

      setTotal(totalAmount);

    }
    catch (err) {

      console.error(err);

      toast.error(
        "Failed to load expenses"
      );

    }
    finally {

      setLoading(false);

    }

  }



  useEffect(() => {

    fetchExpenses();

  }, []);



  /* =====================================
     UI
  ===================================== */

  if (loading) {

    return (

      <div className="p-8">

        Loading expenses...

      </div>

    );

  }



  return (

    <div className="p-8 space-y-6">


      {/* Header */}

      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold">

          Expenses

        </h1>

        <AddExpenseDialog
          onAdded={fetchExpenses}
        />

      </div>



      {/* Total Summary */}

      <Card>

        <CardHeader>

          <CardTitle>

            Total Expenses

          </CardTitle>

        </CardHeader>

        <CardContent className="text-2xl font-bold text-red-600">

          ₹{total.toLocaleString()}

        </CardContent>

      </Card>



      {/* Expenses Table */}

      <Table>

        <TableHeader>

          <TableRow>

            <TableHead>
              Title
            </TableHead>

            <TableHead>
              Category
            </TableHead>

            <TableHead>
              Project
            </TableHead>

            <TableHead>
              Amount
            </TableHead>

            <TableHead>
              Date
            </TableHead>

            <TableHead className="text-right">
              Actions
            </TableHead>

          </TableRow>

        </TableHeader>



        <TableBody>

          {expenses.length === 0 && (

            <TableRow>

              <TableCell colSpan={6}>

                No expenses found

              </TableCell>

            </TableRow>

          )}



          {expenses.map((expense) => (

            <TableRow key={expense.id}>


              <TableCell className="font-medium">

                {expense.title}

              </TableCell>



              <TableCell>

                {expense.category || "-"}

              </TableCell>



              <TableCell>

                {expense.projects?.name || "-"}

              </TableCell>



              <TableCell className="text-red-600 font-semibold">

                ₹{Number(
                  expense.amount
                ).toLocaleString()}

              </TableCell>



              <TableCell>

                {expense.date || "-"}

              </TableCell>



              {/* ACTIONS */}

              <TableCell className="flex gap-2 justify-end">


                <EditExpenseDialog

                  expense={expense}

                  onUpdated={fetchExpenses}

                />


                <DeleteExpenseButton

                  expenseId={expense.id}

                  onDeleted={fetchExpenses}

                />


              </TableCell>


            </TableRow>

          ))}

        </TableBody>

      </Table>

    </div>

  );

}
