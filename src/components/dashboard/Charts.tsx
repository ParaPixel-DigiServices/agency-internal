"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

interface Props {
  data: {
    month: string
    revenue: number
    expenses: number
    profit: number
  }[]
}

export default function RevenueChart({ data }: Props) {

  return (
    <div className="w-full h-[350px]">

      <ResponsiveContainer width="100%" height="100%">

        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#16a34a"
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#dc2626"
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="profit"
            stroke="#2563eb"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  )
}
