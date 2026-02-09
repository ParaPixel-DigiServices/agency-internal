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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";


export default function AddInvoiceDialog({
  onAdded,
}: {
  onAdded: () => void;
}) {

  const [open, setOpen] =
    useState(false);

  const [clients, setClients] =
    useState<any[]>([]);

  const [projects, setProjects] =
    useState<any[]>([]);

  const [clientId, setClientId] =
    useState("");

  const [projectId, setProjectId] =
    useState("");

  const [issueDate, setIssueDate] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

  const [items, setItems] =
    useState([
      {
        description: "",
        quantity: 1,
        unit_price: 0,
        total: 0,
      },
    ]);


  useEffect(() => {

    fetchClients();
    fetchProjects();

  }, []);


  const fetchClients =
    async () => {

      const { data } =
        await supabase
          .from("clients")
          .select("*");

      setClients(data || []);

    };


  const fetchProjects =
    async () => {

      const { data } =
        await supabase
          .from("projects")
          .select("*");

      setProjects(data || []);

    };


  const calculateTotal =
    () =>
      items.reduce(
        (sum, item) =>
          sum + item.total,
        0
      );


  const updateItem =
    (
      index: number,
      field: string,
      value: any
    ) => {

      const newItems =
        [...items];

      newItems[index][field] =
        value;

      newItems[index].total =
        newItems[index].quantity *
        newItems[index].unit_price;

      setItems(newItems);

    };


  const addItem =
    () =>
      setItems([
        ...items,
        {
          description: "",
          quantity: 1,
          unit_price: 0,
          total: 0,
        },
      ]);


  const createInvoice =
    async () => {

      const total =
        calculateTotal();

      const invoice_number =
        "INV-" + Date.now();

      const { data: invoice, error }
        = await supabase
          .from("invoices")
          .insert({

            invoice_number,

            client_id: clientId,

            project_id: projectId,

            amount: total,

            total,

            status: "Draft",

            issue_date: issueDate,

            due_date: dueDate,

          })
          .select()
          .single();

      if (error) {

        console.error(error);
        return;

      }


      const itemsToInsert =
        items.map(item => ({

          ...item,

          invoice_id: invoice.id,

        }));


      await supabase
        .from("invoice_items")
        .insert(itemsToInsert);


      setOpen(false);

      onAdded();

    };


  return (

    <Dialog
      open={open}
      onOpenChange={setOpen}
    >

      <DialogTrigger asChild>

        <Button>

          Create Invoice

        </Button>

      </DialogTrigger>


      <DialogContent className="max-w-2xl">

        <DialogHeader>

          <DialogTitle>

            Create Invoice

          </DialogTitle>

        </DialogHeader>


        {/* Client */}

        <div>

          <Label>
            Client
          </Label>

          <Select
            onValueChange={setClientId}
          >

            <SelectTrigger>

              <SelectValue placeholder="Select client" />

            </SelectTrigger>

            <SelectContent>

              {clients.map(client => (

                <SelectItem
                  key={client.id}
                  value={client.id}
                >

                  {client.name}

                </SelectItem>

              ))}

            </SelectContent>

          </Select>

        </div>


        {/* Project */}

        <div>

          <Label>
            Project
          </Label>

          <Select
            onValueChange={setProjectId}
          >

            <SelectTrigger>

              <SelectValue placeholder="Select project" />

            </SelectTrigger>

            <SelectContent>

              {projects.map(project => (

                <SelectItem
                  key={project.id}
                  value={project.id}
                >

                  {project.name}

                </SelectItem>

              ))}

            </SelectContent>

          </Select>

        </div>


        {/* Dates */}

        <div className="grid grid-cols-2 gap-4">

          <div>

            <Label>
              Issue Date
            </Label>

            <Input
              type="date"
              value={issueDate}
              onChange={(e) =>
                setIssueDate(
                  e.target.value
                )
              }
            />

          </div>


          <div>

            <Label>
              Due Date
            </Label>

            <Input
              type="date"
              value={dueDate}
              onChange={(e) =>
                setDueDate(
                  e.target.value
                )
              }
            />

          </div>

        </div>


        {/* Items */}

        <Label>
          Items
        </Label>


        {items.map((item, index) => (

          <div
            key={index}
            className="grid grid-cols-4 gap-2"
          >

            <Input
              placeholder="Description"
              value={item.description}
              onChange={(e) =>
                updateItem(
                  index,
                  "description",
                  e.target.value
                )
              }
            />

            <Input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) =>
                updateItem(
                  index,
                  "quantity",
                  Number(e.target.value)
                )
              }
            />

            <Input
              type="number"
              placeholder="Unit Price"
              value={item.unit_price}
              onChange={(e) =>
                updateItem(
                  index,
                  "unit_price",
                  Number(e.target.value)
                )
              }
            />

            <Input
              disabled
              value={item.total}
            />

          </div>

        ))}


        <Button
          variant="outline"
          onClick={addItem}
        >

          Add Item

        </Button>


        <div className="font-bold">

          Total: ₹{calculateTotal()}

        </div>


        <Button
          onClick={createInvoice}
        >

          Create Invoice

        </Button>


      </DialogContent>

    </Dialog>

  );

}
