"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ClientProfilePage() {
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    const { data: projectsData } = await supabase
      .from("projects")
      .select("*")
      .eq("client_id", clientId);

    const { data: paymentsData } = await supabase
      .from("payments")
      .select(
        `
        *,
        projects (
          name
        )
      `,
      )
      .eq("client_id", clientId);

    setClient(clientData || null);
    setProjects(projectsData || []);
    setPayments(paymentsData || []);

    const revenue =
      paymentsData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    setTotalRevenue(revenue);

    setLoading(false);
  };

  if (loading) {
    return <div className="p-8">Loading client...</div>;
  }

  if (!client) {
    return <div className="p-8">Client not found</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">{client.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Company</CardTitle>
          </CardHeader>

          <CardContent>{client.company || "-"}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
          </CardHeader>

          <CardContent>{client.email || "-"}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>

          <CardContent>{client.address || "-"}</CardContent>
        </Card>
      </div>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>

          <CardContent className="text-xl font-bold">
            ₹{totalRevenue}
          </CardContent>
        </Card>

      {/* Projects */}

      <div>
        <h2 className="text-xl font-semibold mb-3">Projects</h2>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deadline</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>

                <TableCell>₹{project.budget || 0}</TableCell>

                <TableCell>{project.status}</TableCell>

                <TableCell>{project.deadline || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Payments */}

      <div>
        <h2 className="text-xl font-semibold mb-3">Payments</h2>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.projects?.name}</TableCell>

                <TableCell>₹{payment.amount}</TableCell>

                <TableCell>{payment.method || "-"}</TableCell>

                <TableCell>{payment.payment_date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
