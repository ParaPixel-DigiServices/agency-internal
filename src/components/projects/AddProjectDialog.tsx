"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Client {
  id: string
  name: string
}

export default function AddProjectDialog({
  onProjectAdded,
}: {
  onProjectAdded: () => void
}) {

  const [open, setOpen] = useState(false)

  const [clients, setClients] = useState<Client[]>([])

  const [form, setForm] = useState({
    name: "",
    client_id: "",
    budget: "",
    deadline: "",
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("id, name")

    if (data) setClients(data)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async () => {

    if (!form.name || !form.client_id) return

    setLoading(true)

    const { error } = await supabase
      .from("projects")
      .insert([
        {
          name: form.name,
          client_id: form.client_id,
          budget: form.budget ? Number(form.budget) : null,
          deadline: form.deadline || null,
        },
      ])

    setLoading(false)

    if (!error) {

      setForm({
        name: "",
        client_id: "",
        budget: "",
        deadline: "",
      })

      setOpen(false)
      onProjectAdded()

    } else {
      alert(error.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogTrigger asChild>
        <Button>Add Project</Button>
      </DialogTrigger>

      <DialogContent>

        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <div>
            <Label>Project Name *</Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Client *</Label>

            <select
              name="client_id"
              value={form.client_id}
              onChange={handleChange}
              className="w-full border rounded p-2 bg-background"
            >

              <option value="">Select client</option>

              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}

            </select>

          </div>

          <div>
            <Label>Budget</Label>
            <Input
              name="budget"
              type="number"
              value={form.budget}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Deadline</Label>
            <Input
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Adding..." : "Add Project"}
          </Button>

        </div>

      </DialogContent>

    </Dialog>
  )
}
