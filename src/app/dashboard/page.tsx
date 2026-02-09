"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import RevenueChart from "@/components/dashboard/Charts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DashboardPage() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [viewType, setViewType] = useState<"monthly" | "yearly">("monthly");

  const [stats, setStats] = useState({
    clients: 0,
    projects: 0,

    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0,

    monthlyRevenue: 0,
    monthlyExpenses: 0,
    monthlyProfit: 0,

    outstanding: 0,

    paidInvoices: 0,
    unpaidInvoices: 0,
    overdueInvoices: 0,
  });

  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    setLoading(true);

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    /* ================================
       FETCH BASIC COUNTS
    ================================ */

    const { count: clientsCount } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true });

    const { count: projectsCount } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true });

    /* ================================
       FETCH PAYMENTS
    ================================ */

    const { data: payments } = await supabase
      .from("payments")
      .select(
        `
        *,
        clients(name),
        projects(name)
      `,
      )
      .order("created_at", { ascending: false });

    /* ================================
       FETCH EXPENSES
    ================================ */

    const { data: expenses } = await supabase.from("expenses").select("*");

    /* ================================
       FETCH INVOICES
    ================================ */

    const { data: invoices } = await supabase
      .from("invoices")
      .select("total, status");

    /* ================================
       CALCULATE TOTALS
    ================================ */

    let totalRevenue = 0;
    let totalExpenses = 0;

    let monthlyRevenue = 0;
    let monthlyExpenses = 0;

    payments?.forEach((p) => {
      const amount = Number(p.amount);
      totalRevenue += amount;

      const date = new Date(p.created_at);

      if (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      ) {
        monthlyRevenue += amount;
      }
    });

    expenses?.forEach((e) => {
      const amount = Number(e.amount);
      totalExpenses += amount;

      const date = new Date(e.created_at);

      if (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      ) {
        monthlyExpenses += amount;
      }
    });

    /* ================================
       OUTSTANDING
    ================================ */

    let outstanding = 0;
    let paidInvoices = 0;
    let unpaidInvoices = 0;
    let overdueInvoices = 0;

    invoices?.forEach((inv) => {
      if (inv.status === "Paid") {
        paidInvoices++;
      } else if (inv.status === "Overdue") {
        overdueInvoices++;
        outstanding += Number(inv.total);
      } else {
        unpaidInvoices++;
        outstanding += Number(inv.total);
      }
    });

    /* ================================
       SET STATS
    ================================ */

    setStats({
      clients: clientsCount || 0,
      projects: projectsCount || 0,

      totalRevenue,
      totalExpenses,
      totalProfit: totalRevenue - totalExpenses,

      monthlyRevenue,
      monthlyExpenses,
      monthlyProfit: monthlyRevenue - monthlyExpenses,

      outstanding,

      paidInvoices,
      unpaidInvoices,
      overdueInvoices,
    });

    /* ================================
       CHART DATA CALCULATION
    ================================ */

    calculateChartData(payments, expenses, viewType);

    setRecentPayments(payments?.slice(0, 5) || []);

    setLoading(false);
  }

  function calculateChartData(
    payments: any,
    expenses: any,
    type: "monthly" | "yearly",
  ) {
    if (type === "monthly") {
      // Last 12 months
      const last12Months = [];
      const today = new Date();

      for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        last12Months.push({
          month: date.toLocaleString("default", {
            month: "short",
            year: "numeric",
          }),
          year: date.getFullYear(),
          monthIndex: date.getMonth(),
        });
      }

      const monthlyRevenueMap: any = {};
      const monthlyExpenseMap: any = {};

      payments?.forEach((p: any) => {
        const date = new Date(p.created_at);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        monthlyRevenueMap[key] =
          (monthlyRevenueMap[key] || 0) + Number(p.amount);
      });

      expenses?.forEach((e: any) => {
        const date = new Date(e.created_at);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        monthlyExpenseMap[key] =
          (monthlyExpenseMap[key] || 0) + Number(e.amount);
      });

      const chart = last12Months.map(({ month, year, monthIndex }) => {
        const key = `${year}-${monthIndex}`;
        const revenue = monthlyRevenueMap[key] || 0;
        const expense = monthlyExpenseMap[key] || 0;

        return {
          month,
          revenue,
          expenses: expense,
          profit: revenue - expense,
        };
      });

      setChartData(chart);
    } else {
      // Yearly from 2026 to current year
      const currentYear = new Date().getFullYear();
      const years = [];

      for (let year = 2026; year <= currentYear; year++) {
        years.push(year);
      }

      const yearlyRevenueMap: any = {};
      const yearlyExpenseMap: any = {};

      payments?.forEach((p: any) => {
        const year = new Date(p.created_at).getFullYear();
        yearlyRevenueMap[year] =
          (yearlyRevenueMap[year] || 0) + Number(p.amount);
      });

      expenses?.forEach((e: any) => {
        const year = new Date(e.created_at).getFullYear();
        yearlyExpenseMap[year] =
          (yearlyExpenseMap[year] || 0) + Number(e.amount);
      });

      const chart = years.map((year) => {
        const revenue = yearlyRevenueMap[year] || 0;
        const expense = yearlyExpenseMap[year] || 0;

        return {
          month: year.toString(),
          revenue,
          expenses: expense,
          profit: revenue - expense,
        };
      });

      setChartData(chart);
    }
  }

  useEffect(() => {
    if (recentPayments.length > 0) {
      // Recalculate chart data when view type changes
      const fetchData = async () => {
        const { data: payments } = await supabase
          .from("payments")
          .select(
            `
            *,
            clients(name),
            projects(name)
          `,
          )
          .order("created_at", { ascending: false });

        const { data: expenses } = await supabase.from("expenses").select("*");

        calculateChartData(payments, expenses, viewType);
      };
      fetchData();
    }
  }, [viewType]);

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-10 w-48" />

        {/* MAIN STATS SKELETON */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* MONTHLY STATS SKELETON */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CHART SKELETON */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>

        {/* TABLE SKELETON */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* MAIN STATS */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>

          <CardContent className="text-2xl font-bold text-green-600">
            ₹{stats.totalRevenue.toLocaleString()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>

          <CardContent className="text-2xl font-bold text-red-600">
            ₹{stats.totalExpenses.toLocaleString()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Profit</CardTitle>
          </CardHeader>

          <CardContent className="text-2xl font-bold text-blue-600">
            ₹{stats.totalProfit.toLocaleString()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outstanding</CardTitle>
          </CardHeader>

          <CardContent className="text-2xl font-bold text-orange-600">
            ₹{stats.outstanding.toLocaleString()}
          </CardContent>
        </Card>
      </div>

      {/* MONTHLY STATS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>This Month Revenue</CardTitle>
          </CardHeader>

          <CardContent className="text-xl font-bold text-green-600">
            ₹{stats.monthlyRevenue.toLocaleString()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Month Expenses</CardTitle>
          </CardHeader>

          <CardContent className="text-xl font-bold text-red-600">
            ₹{stats.monthlyExpenses.toLocaleString()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Month Profit</CardTitle>
          </CardHeader>

          <CardContent className="text-xl font-bold text-blue-600">
            ₹{stats.monthlyProfit.toLocaleString()}
          </CardContent>
        </Card>
      </div>

      {/* CHART */}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Financial Overview</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewType === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={viewType === "yearly" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("yearly")}
            >
              Yearly
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <RevenueChart data={chartData} />
        </CardContent>
      </Card>

      {/* RECENT PAYMENTS */}

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {recentPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.clients?.name}</TableCell>

                  <TableCell>{payment.projects?.name}</TableCell>

                  <TableCell className="text-green-600 font-semibold">
                    ₹{payment.amount}
                  </TableCell>

                  <TableCell>{payment.created_at?.split("T")[0]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
