"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

import AddPaymentDialog from "@/components/payments/AddPaymentDialog"

import { Payment } from "@/types/payment"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function PaymentsPage() {

  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPayments = async () => {

    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        clients (
          name
        ),
        projects (
          name
        )
      `)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setPayments(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  return (
    <div className="p-8">

      <div className="flex justify-between mb-6">

        <h1 className="text-2xl font-bold">
          Payments
        </h1>

        <AddPaymentDialog onPaymentAdded={fetchPayments} />

      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (

        <Table>

          <TableHeader>

            <TableRow>

              <TableHead>Client</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>

            </TableRow>

          </TableHeader>

          <TableBody>

            {payments.map((payment) => (

              <TableRow key={payment.id}>

                <TableCell>
                  {payment.clients?.name}
                </TableCell>

                <TableCell>
                  {payment.projects?.name}
                </TableCell>

                <TableCell>
                  ₹{payment.amount}
                </TableCell>

                <TableCell>
                  {payment.method || "-"}
                </TableCell>

                <TableCell>
                  {payment.payment_date}
                </TableCell>

              </TableRow>

            ))}

          </TableBody>

        </Table>

      )}

    </div>
  )
}
