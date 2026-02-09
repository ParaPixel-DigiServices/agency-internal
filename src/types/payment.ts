export interface Payment {
  id: string
  client_id: string
  project_id: string
  amount: number
  status: string
  method: string | null
  payment_date: string
  created_at: string

  clients?: {
    name: string
  }

  projects?: {
    name: string
  }
}
