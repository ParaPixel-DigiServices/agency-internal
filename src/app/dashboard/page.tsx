"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import RevenueChart from "@/components/dashboard/Charts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import LogoutButton from "@/components/LogoutButton"

export default function DashboardPage() {

  const [chartData, setChartData] = useState<any[]>([])

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
  })

  const [recentPayments, setRecentPayments] = useState<any[]>([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {

    setLoading(true)

    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    /* ================================
       FETCH BASIC COUNTS
    ================================ */

    const { count: clientsCount } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })

    const { count: projectsCount } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })


    /* ================================
       FETCH PAYMENTS
    ================================ */

    const { data: payments } = await supabase
      .from("payments")
      .select(`
        *,
        clients(name),
        projects(name)
      `)
      .order("created_at", { ascending: false })


    /* ================================
       FETCH EXPENSES
    ================================ */

    const { data: expenses } = await supabase
      .from("expenses")
      .select("*")


    /* ================================
       FETCH INVOICES
    ================================ */

    const { data: invoices } = await supabase
      .from("invoices")
      .select("total, status")


    /* ================================
       CALCULATE TOTALS
    ================================ */

    let totalRevenue = 0
    let totalExpenses = 0

    let monthlyRevenue = 0
    let monthlyExpenses = 0

    payments?.forEach(p => {

      const amount = Number(p.amount)
      totalRevenue += amount

      const date = new Date(p.created_at)

      if (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      ) {
        monthlyRevenue += amount
      }

    })

    expenses?.forEach(e => {

      const amount = Number(e.amount)
      totalExpenses += amount

      const date = new Date(e.created_at)

      if (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      ) {
        monthlyExpenses += amount
      }

    })


    /* ================================
       OUTSTANDING
    ================================ */

    let outstanding = 0
    let paidInvoices = 0
    let unpaidInvoices = 0
    let overdueInvoices = 0

    invoices?.forEach(inv => {

      if (inv.status === "Paid") {
        paidInvoices++
      }
      else if (inv.status === "Overdue") {
        overdueInvoices++
        outstanding += Number(inv.total)
      }
      else {
        unpaidInvoices++
        outstanding += Number(inv.total)
      }

    })


    /* ================================
       MONTHLY CHART DATA
    ================================ */

    const months =
      ["Jan","Feb","Mar","Apr","May","Jun",
       "Jul","Aug","Sep","Oct","Nov","Dec"]

    const monthlyRevenueMap: any = {}
    const monthlyExpenseMap: any = {}

    payments?.forEach(p => {

      const month =
        new Date(p.created_at)
        .toLocaleString("default", { month: "short" })

      monthlyRevenueMap[month] =
        (monthlyRevenueMap[month] || 0)
        + Number(p.amount)

    })

    expenses?.forEach(e => {

      const month =
        new Date(e.created_at)
        .toLocaleString("default", { month: "short" })

      monthlyExpenseMap[month] =
        (monthlyExpenseMap[month] || 0)
        + Number(e.amount)

    })

    const chart = months.map(month => {

      const revenue =
        monthlyRevenueMap[month] || 0

      const expense =
        monthlyExpenseMap[month] || 0

      return {

        month,
        revenue,
        expenses: expense,
        profit: revenue - expense,

      }

    })


    setChartData(chart)


    /* ================================
       SET STATS
    ================================ */

    setStats({

      clients: clientsCount || 0,
      projects: projectsCount || 0,

      totalRevenue,
      totalExpenses,
      totalProfit:
        totalRevenue - totalExpenses,

      monthlyRevenue,
      monthlyExpenses,
      monthlyProfit:
        monthlyRevenue - monthlyExpenses,

      outstanding,

      paidInvoices,
      unpaidInvoices,
      overdueInvoices,

    })


    setRecentPayments(
      payments?.slice(0, 5) || []
    )

    setLoading(false)

  }


  if (loading)
    return <div className="p-8">Loading dashboard...</div>


  return (

    <div className="p-8 space-y-8">

      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <LogoutButton />


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

        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
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

              {recentPayments.map(payment => (

                <TableRow key={payment.id}>

                  <TableCell>
                    {payment.clients?.name}
                  </TableCell>

                  <TableCell>
                    {payment.projects?.name}
                  </TableCell>

                  <TableCell className="text-green-600 font-semibold">
                    ₹{payment.amount}
                  </TableCell>

                  <TableCell>
                    {payment.created_at?.split("T")[0]}
                  </TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        </CardContent>

      </Card>


    </div>

  )

}
