"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

export default function AddPaymentDialog({
  onPaymentAdded,
}: {
  onPaymentAdded: () => void;
}) {
  const [open, setOpen] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [form, setForm] = useState({
    client_id: "",
    project_id: "",
    amount: "",
    method: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  // Fetch projects when client is selected
  useEffect(() => {
    if (form.client_id) {
      fetchProjectsByClient(form.client_id);
    } else {
      setProjects([]);
    }
  }, [form.client_id]);

  const fetchClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("id, name")
      .order("name");

    if (data) setClients(data);
  };

  const fetchProjectsByClient = async (clientId: string) => {
    const { data } = await supabase
      .from("projects")
      .select("id, name")
      .eq("client_id", clientId)
      .order("name");

    if (data) setProjects(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Reset project when client changes
    if (name === "client_id") {
      setForm({
        ...form,
        client_id: value,
        project_id: "", // Clear project selection
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const handleSubmit = async () => {
    if (!form.client_id || !form.project_id || !form.amount) return;

    setLoading(true);

    const { error } = await supabase.from("payments").insert([
      {
        client_id: form.client_id,
        project_id: form.project_id,
        amount: Number(form.amount),
        method: form.method,
      },
    ]);

    setLoading(false);

    if (!error) {
      setForm({
        client_id: "",
        project_id: "",
        amount: "",
        method: "",
      });

      setOpen(false);
      onPaymentAdded();
    } else {
      alert(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Payment</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
            <Label>Project *</Label>

            <select
              name="project_id"
              value={form.project_id}
              onChange={handleChange}
              disabled={!form.client_id}
              className="w-full border rounded p-2 bg-background disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {!form.client_id
                  ? "Select a client first"
                  : projects.length === 0
                    ? "No projects for this client"
                    : "Select project"}
              </option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Amount *</Label>
            <Input
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Method</Label>
            <Input
              name="method"
              placeholder="UPI, Bank, Stripe..."
              value={form.method}
              onChange={handleChange}
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Adding..." : "Add Payment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
