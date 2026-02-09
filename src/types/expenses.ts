export interface Expense {
  id: string
  title: string
  amount: number
  category: string | null
  date: string
  notes: string | null
  created_at: string
}
