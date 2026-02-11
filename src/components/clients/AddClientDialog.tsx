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

import { ClientSchema } from "@/lib/validation";

import { toast } from "sonner";

export default function AddClientDialog({
  onClientAdded,
}: {
  onClientAdded: () => void;
}) {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",

    company: "",

    email: "",

    phone: "",

    address: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({
      ...form,

      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    // Validate input
    const result = ClientSchema.safeParse({
      name: form.name,
      company: form.company,
      email: form.email,
      phone: form.phone,
    });

    if (!result.success) {
      const errors = result.error.issues.map((e) => e.message).join(", ");
      toast.error(errors);
      return;
    }

    setLoading(true);

    const { error } = await supabase

      .from("clients")

      .insert({
        name: form.name,

        company: form.company,

        email: form.email,

        phone: form.phone,

        address: form.address,
      });

    setLoading(false);

    if (error) {
      toast.error(error.message);

      return;
    }

    toast.success("Client created");

    setForm({
      name: "",

      company: "",

      email: "",

      phone: "",

      address: "",
    });

    setOpen(false);

    onClientAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Client</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Name *</Label>

            <Input name="name" value={form.name} onChange={handleChange} />
          </div>

          <div>
            <Label>Company</Label>

            <Input
              name="company"
              value={form.company}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Email</Label>

            <Input name="email" value={form.email} onChange={handleChange} />
          </div>

          <div>
            <Label>Phone</Label>

            <Input name="phone" value={form.phone} onChange={handleChange} />
          </div>

          <div>
            <Label>Address</Label>

            <Textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Adding..." : "Add Client"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
