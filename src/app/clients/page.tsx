"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Client } from "@/types/client";
import Link from "next/link";

import AddClientDialog from "@/components/clients/AddClientDialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeleteClientButton from "@/components/clients/DeleteClientButton";
import EditClientDialog from "@/components/clients/EditClientDialog";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setClients(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>

        <AddClientDialog onClientAdded={fetchClients} />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <Link
                    href={`/clients/${client.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    {client.name}
                  </Link>
                </TableCell>

                <TableCell>{client.company || "-"}</TableCell>

                <TableCell>{client.email || "-"}</TableCell>

                <TableCell>{client.phone || "-"}</TableCell>

                <TableCell>{client.status}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <EditClientDialog
                      client={client}
                      onUpdated={fetchClients}
                    />

                    <DeleteClientButton
                      clientId={client.id}
                      clientName={client.name}
                      onDeleted={fetchClients}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
