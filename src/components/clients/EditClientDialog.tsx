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

export default function EditClientDialog({
  client,
  onUpdated,
}: {
  client: any;
  onUpdated: () => void;
}) {

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: client.name || "",
    company: client.company || "",
    email: client.email || "",
    phone: client.phone || "",
    address: client.address || "",
  });


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };


  const updateClient = async () => {

    if (!form.name.trim()) return;

    setLoading(true);

    const { error } = await supabase
      .from("clients")
      .update(form)
      .eq("id", client.id);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

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

          <DialogTitle>Edit Client</DialogTitle>

        </DialogHeader>


        <div className="space-y-4">


          <div>

            <Label>Name</Label>

            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
            />

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

            <Input
              name="email"
              value={form.email}
              onChange={handleChange}
            />

          </div>


          <div>

            <Label>Phone</Label>

            <Input
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />

          </div>


          <div>

            <Label>Address</Label>

            <Textarea
              name="address"
              value={form.address}
              onChange={handleChange}
            />

          </div>


          <Button
            onClick={updateClient}
            disabled={loading}
            className="w-full"
          >

            {loading ? "Updating..." : "Update Client"}

          </Button>


        </div>

      </DialogContent>

    </Dialog>

  );

}
