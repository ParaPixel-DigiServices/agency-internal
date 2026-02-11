"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";

import { toast } from "sonner";

import { ExpenseSchema } from "@/lib/validation";

export default function AddExpenseDialog({
  projectId,
  onAdded,
}: {
  projectId?: string;
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [projects, setProjects] = useState<any[]>([]);

  const [form, setForm] = useState({
    title: "",

    amount: "",

    category: "",

    date: new Date().toISOString().split("T")[0],

    notes: "",

    project_id: projectId || "",
  });

  /* ===============================
     FETCH PROJECTS
  =============================== */

  useEffect(() => {
    if (!projectId) {
      fetchProjects();
    }
  }, [projectId]);

  async function fetchProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name")
      .order("name");

    if (!error) {
      setProjects(data || []);
    }
  }

  /* ===============================
     CREATE EXPENSE
  =============================== */

  async function createExpense() {
    // Validate input
    const result = ExpenseSchema.safeParse({
      title: form.title,
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      notes: form.notes,
    });

    if (!result.success) {
      const errors = result.error.issues.map((e) => e.message).join(", ");
      toast.error(errors);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("expenses").insert({
        title: form.title,

        amount: Number(form.amount),

        category: form.category || null,

        date: form.date || null,

        notes: form.notes || null,

        project_id: form.project_id || null,
      });

      if (error) {
        toast.error(error.message);

        return;
      }

      toast.success("Expense created");

      /* Reset form */

      setForm({
        title: "",

        amount: "",

        category: "",

        date: new Date().toISOString().split("T")[0],

        notes: "",

        project_id: projectId || "",
      });

      setOpen(false);

      onAdded();
    } catch (err) {
      console.error(err);

      toast.error("Failed to create expense");
    } finally {
      setLoading(false);
    }
  }

  /* ===============================
     UI
  =============================== */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Expense</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Create a new expense entry for your project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}

          <div>
            <Label>Title *</Label>

            <Input
              placeholder="Hosting, domain, software..."
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
            />
          </div>

          {/* Amount */}

          <div>
            <Label>Amount *</Label>

            <Input
              type="number"
              placeholder="₹ amount"
              value={form.amount}
              onChange={(e) =>
                setForm({
                  ...form,
                  amount: e.target.value,
                })
              }
            />
          </div>

          {/* Category */}

          <div>
            <Label>Category</Label>

            <Input
              placeholder="Hosting, Marketing, Tools..."
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                })
              }
            />
          </div>

          {/* Date */}

          <div>
            <Label>Date</Label>

            <Input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm({
                  ...form,
                  date: e.target.value,
                })
              }
            />
          </div>

          {/* Project */}

          {!projectId && (
            <div>
              <Label>Project</Label>

              <Select
                value={form.project_id}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    project_id: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>

                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}

          <div>
            <Label>Notes</Label>

            <Textarea
              placeholder="Optional notes..."
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
              className="max-h-32 overflow-y-auto resize-none"
              rows={4}
            />
          </div>

          {/* Submit */}

          <Button onClick={createExpense} disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Expense"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
