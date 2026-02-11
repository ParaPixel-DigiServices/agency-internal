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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";

import { InvoiceSchema, InvoiceItemSchema } from "@/lib/validation";
import { formatDatabaseError } from "@/lib/utils";

import { toast } from "sonner";

export default function AddInvoiceDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);

  const [clients, setClients] = useState<any[]>([]);

  const [projects, setProjects] = useState<any[]>([]);

  const [clientId, setClientId] = useState("");

  const [projectId, setProjectId] = useState("");

  const [issueDate, setIssueDate] = useState("");

  const [dueDate, setDueDate] = useState("");

  const [items, setItems] = useState([
    {
      description: "",
      quantity: 1,
      unit_price: 0,
      total: 0,
    },
  ]);

  useEffect(() => {
    fetchClients();
  }, []);

  // Fetch projects when client is selected
  useEffect(() => {
    if (clientId) {
      fetchProjectsByClient(clientId);
    } else {
      setProjects([]);
      setProjectId("");
    }
  }, [clientId]);

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("*");

    setClients(data || []);
  };

  const fetchProjectsByClient = async (clientId: string) => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("client_id", clientId);

    setProjects(data || []);
  };

  const calculateTotal = () => items.reduce((sum, item) => sum + item.total, 0);

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];

    if (field === "description") {
      newItems[index].description = value as string;
    } else if (field === "quantity") {
      newItems[index].quantity = value as number;
    } else if (field === "unit_price") {
      newItems[index].unit_price = value as number;
    }

    newItems[index].total =
      newItems[index].quantity * newItems[index].unit_price;

    setItems(newItems);
  };

  const addItem = () =>
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        unit_price: 0,
        total: 0,
      },
    ]);

  const createInvoice = async () => {
    // Validate invoice
    const invoiceResult = InvoiceSchema.safeParse({
      client_id: clientId,
      project_id: projectId,
      issue_date: issueDate,
      due_date: dueDate,
    });

    if (!invoiceResult.success) {
      const errors = invoiceResult.error.issues
        .map((e) => e.message)
        .join(", ");
      toast.error(errors);
      return;
    }

    // Validate all items
    for (let i = 0; i < items.length; i++) {
      const itemResult = InvoiceItemSchema.safeParse(items[i]);
      if (!itemResult.success) {
        const errors = itemResult.error.issues.map((e) => e.message).join(", ");
        toast.error(`Item ${i + 1}: ${errors}`);
        return;
      }
    }

    const total = calculateTotal();

    const invoice_number = "INV-" + Date.now();

    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert({
        invoice_number,

        client_id: clientId,

        project_id: projectId || null,

        amount: total,

        total,

        status: "Draft",

        issue_date: issueDate,

        due_date: dueDate,
      })
      .select()
      .single();

    if (error) {
      toast.error(formatDatabaseError(error));
      return;
    }

    const itemsToInsert = items.map((item) => ({
      ...item,

      invoice_id: invoice.id,
    }));

    await supabase.from("invoice_items").insert(itemsToInsert);

    toast.success("Invoice created");
    setOpen(false);

    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Invoice</Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>

          <DialogDescription>
            Create a new invoice for your client and project.
          </DialogDescription>
        </DialogHeader>

        {/* Client */}

        <div>
          <Label>Client</Label>

          <Select onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Select client" />
            </SelectTrigger>

            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Project */}

        <div>
          <Label>
            Project{" "}
            {!clientId && (
              <span className="text-xs text-muted-foreground">
                (Select client first)
              </span>
            )}
          </Label>

          <Select
            value={projectId}
            onValueChange={setProjectId}
            disabled={!clientId}
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

        {/* Dates */}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Issue Date</Label>

            <Input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>

          <div>
            <Label>Due Date</Label>

            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Items */}

        <div>
          <Label>Items</Label>

          {/* Column Headers */}
          <div className="grid grid-cols-4 gap-2 mb-1 mt-2">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Label className="text-xs text-muted-foreground">Quantity</Label>
            <Label className="text-xs text-muted-foreground">
              Unit Price (₹)
            </Label>
            <Label className="text-xs text-muted-foreground">Total (₹)</Label>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 mb-2">
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  updateItem(index, "description", e.target.value)
                }
              />

              <Input
                type="number"
                placeholder="0"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, "quantity", Number(e.target.value))
                }
              />

              <Input
                type="number"
                placeholder="0.00"
                value={item.unit_price}
                onChange={(e) =>
                  updateItem(index, "unit_price", Number(e.target.value))
                }
              />

              <Input
                disabled
                value={item.total.toFixed(2)}
                className="bg-muted"
              />
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addItem}>
          Add Item
        </Button>

        <div className="font-bold">Total: ₹{calculateTotal()}</div>

        <Button onClick={createInvoice}>Create Invoice</Button>
      </DialogContent>
    </Dialog>
  );
}
