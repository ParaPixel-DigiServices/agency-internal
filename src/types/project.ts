export interface Project {
  id: string
  name: string
  client_id: string
  budget: number | null
  status: string
  description: string | null
  created_at: string

  clients?: {
    name: string
  }

  total_paid?: number
  outstanding?: number

  payment_status?: "Paid" | "Partial" | "Unpaid"
}
