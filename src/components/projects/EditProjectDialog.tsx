"use client";

import { useState } from "react";

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

import { Textarea } from "@/components/ui/textarea";

import { Pencil } from "lucide-react";

import { ProjectSchema } from "@/lib/validation";

import { toast } from "sonner";

export default function EditProjectDialog({
  project,
  onUpdated,
}: {
  project: any;
  onUpdated: () => void;
}) {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: project.name || "",
    budget: project.budget || "",
    status: project.status || "Planning",
    deadline: project.deadline || "",
    description: project.description || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const updateProject = async () => {
    // Validate input
    const result = ProjectSchema.safeParse({
      name: form.name,
      budget: form.budget ? Number(form.budget) : 0,
      deadline: form.deadline,
      status: form.status,
    });

    if (!result.success) {
      const errors = result.error.issues.map((e) => e.message).join(", ");
      toast.error(errors);
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("projects")
      .update({
        ...form,
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id);

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Project updated");
    setOpen(false);

    onUpdated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Name</Label>

            <Input name="name" value={form.name} onChange={handleChange} />
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

          <div>
            <Label>Description</Label>

            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <Button onClick={updateProject} disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
