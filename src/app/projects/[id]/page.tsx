"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import AddExpenseDialog from "@/components/expenses/AddExpenseDialog";

export default function ProjectProfilePage() {
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);

  const [project, setProject] = useState<any>(null);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  const [timeline, setTimeline] = useState<any[]>([]);

  const [totalInvoiced, setTotalInvoiced] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    fetchProjectData();
  }, []);

  async function fetchProjectData() {
    try {
      setLoading(true);

      /* ===============================
         FETCH CORE DATA
      =============================== */

      const { data: projectData } = await supabase
        .from("projects")
        .select(
          `
            *,
            clients(name)
          `,
        )
        .eq("id", projectId)
        .single();

      const { data: invoicesData } = await supabase
        .from("invoices")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      const { data: expensesData } = await supabase
        .from("expenses")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      /* ===============================
         STORE DATA
      =============================== */

      setProject(projectData || null);
      setInvoices(invoicesData || []);
      setPayments(paymentsData || []);
      setExpenses(expensesData || []);

      /* ===============================
         CALCULATE TOTALS
      =============================== */

      const invoiced = (invoicesData || []).reduce(
        (sum, inv) => sum + Number(inv.total || 0),
        0,
      );

      const paid = (paymentsData || []).reduce(
        (sum, pay) => sum + Number(pay.amount || 0),
        0,
      );

      const expensesTotal = (expensesData || []).reduce(
        (sum, exp) => sum + Number(exp.amount || 0),
        0,
      );

      setTotalInvoiced(invoiced);
      setTotalPaid(paid);
      setTotalExpenses(expensesTotal);

      /* ===============================
         BUILD TIMELINE
      =============================== */

      const timelineEvents = [
        projectData && {
          type: "project",
          title: "Project created",
          date: projectData.created_at,
        },

        ...(invoicesData || []).map((inv) => ({
          type: "invoice",
          title: `Invoice ${inv.invoice_number}`,
          amount: inv.total,
          date: inv.created_at,
        })),

        ...(paymentsData || []).map((pay) => ({
          type: "payment",
          title: "Payment received",
          amount: pay.amount,
          date: pay.created_at,
        })),

        ...(expensesData || []).map((exp) => ({
          type: "expense",
          title: `Expense: ${exp.description}`,
          amount: exp.amount,
          date: exp.created_at,
        })),
      ].filter(Boolean);

      timelineEvents.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      setTimeline(timelineEvents);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8">Loading project...</div>;

  if (!project) return <div className="p-8">Project not found</div>;

  const outstanding = totalInvoiced - totalPaid;

  const profit = totalPaid - totalExpenses;

  return (
    <div className="p-8 space-y-8">
      {/* HEADER */}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{project.name}</h1>

        <AddExpenseDialog projectId={projectId} onAdded={fetchProjectData} />
      </div>

      {/* PROJECT INFO */}

      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent>{project.clients?.name || "-"}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
          </CardHeader>
          <CardContent>₹{project.budget || 0}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>{project.status}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deadline</CardTitle>
          </CardHeader>
          <CardContent>{project.deadline || "-"}</CardContent>
        </Card>
      </div>

      {/* FINANCIAL SUMMARY */}

      <div className="grid md:grid-cols-5 gap-6">
        <SummaryCard title="Total Invoiced" value={totalInvoiced} />

        <SummaryCard
          title="Total Paid"
          value={totalPaid}
          color="text-green-600"
        />

        <SummaryCard
          title="Expenses"
          value={totalExpenses}
          color="text-orange-600"
        />

        <SummaryCard
          title="Outstanding"
          value={outstanding}
          color="text-red-600"
        />

        <SummaryCard
          title="Profit"
          value={profit}
          color={profit >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>

      {/* ACTIVITY TIMELINE */}

      <div>
        <h2 className="text-xl font-semibold mb-4">Activity Timeline</h2>

        <div className="space-y-3">
          {timeline.map((event, index) => (
            <Card key={index}>
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <div className="font-medium">{event.title}</div>

                  <div className="text-sm text-gray-500">
                    {event.date?.split("T")[0]}
                  </div>
                </div>

                {event.amount && (
                  <div
                    className={`font-bold
                    ${
                      event.type === "payment"
                        ? "text-green-600"
                        : event.type === "expense"
                          ? "text-red-600"
                          : "text-blue-600"
                    }`}
                  >
                    ₹{event.amount}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* INVOICES TABLE */}

      <DataTable
        title="Invoices"
        columns={["Invoice #", "Amount", "Status", "Date"]}
        data={invoices.map((inv) => [
          inv.invoice_number,
          `₹${inv.total}`,
          inv.status,
          inv.issue_date || "-",
        ])}
      />

      {/* PAYMENTS TABLE */}

      <DataTable
        title="Payments"
        columns={["Amount", "Method", "Date"]}
        data={payments.map((pay) => [
          `₹${pay.amount}`,
          pay.method,
          pay.payment_date,
        ])}
      />

      {/* EXPENSES TABLE */}

      <DataTable
        title="Expenses"
        columns={["Description", "Amount", "Date"]}
        data={expenses.map((exp) => [
          exp.description,
          `₹${exp.amount}`,
          exp.created_at?.split("T")[0],
        ])}
      />
    </div>
  );
}

/* ===============================
   REUSABLE COMPONENTS
=============================== */

function SummaryCard({ title, value, color = "" }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent className={`text-xl font-bold ${color}`}>
        ₹{value}
      </CardContent>
    </Card>
  );
}

function DataTable({ title, columns, data }: any) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">{title}</h2>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col: string, i: number) => (
              <TableHead key={i}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row: any, i: number) => (
            <TableRow key={i}>
              {row.map((cell: any, j: number) => (
                <TableCell key={j}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
