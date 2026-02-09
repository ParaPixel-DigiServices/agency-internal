"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

import AddProjectDialog from "@/components/projects/AddProjectDialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Project } from "@/types/project";

import DeleteProjectButton from "@/components/projects/DeleteProjectButton";
import EditProjectDialog from "@/components/projects/EditProjectDialog";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);

    // Fetch projects with client info
    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select(
        `
        *,
        clients (
          name
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (projectsError) {
      console.error(projectsError);
      setLoading(false);
      return;
    }

    // Fetch payments
    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select("project_id, amount");

    if (paymentsError) {
      console.error(paymentsError);
    }

    // Create payment sum map
    const paymentsMap: Record<string, number> = {};

    paymentsData?.forEach((payment) => {
      if (!paymentsMap[payment.project_id]) {
        paymentsMap[payment.project_id] = 0;
      }

      paymentsMap[payment.project_id] += Number(payment.amount);
    });

    // Merge projects with payment info
    const enrichedProjects: Project[] =
      projectsData?.map((project) => {
        const totalPaid = paymentsMap[project.id] || 0;
        const budget = project.budget || 0;

        let paymentStatus: "Paid" | "Partial" | "Unpaid" = "Unpaid";

        if (totalPaid === 0) {
          paymentStatus = "Unpaid";
        } else if (totalPaid < budget) {
          paymentStatus = "Partial";
        } else {
          paymentStatus = "Paid";
        }

        return {
          ...project,
          total_paid: totalPaid,
          outstanding: budget - totalPaid,
          payment_status: paymentStatus,
        };
      }) || [];

    setProjects(enrichedProjects);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>

        <AddProjectDialog onProjectAdded={fetchProjects} />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Outstanding</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <a
                    href={`/projects/${project.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {project.name}
                  </a>
                </TableCell>

                <TableCell>{project.clients?.name}</TableCell>

                <TableCell>₹{project.budget || 0}</TableCell>

                <TableCell className="text-green-600 font-medium">
                  ₹{project.total_paid || 0}
                </TableCell>

                <TableCell className="text-red-600 font-medium">
                  ₹{project.outstanding || 0}
                </TableCell>

                <TableCell>
                  <span
                    className={`
      px-2 py-1 rounded text-sm font-medium
      ${
        project.payment_status === "Paid"
          ? "bg-green-100 text-green-700"
          : project.payment_status === "Partial"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-red-100 text-red-700"
      }
    `}
                  >
                    {project.payment_status}
                  </span>
                </TableCell>

                <TableCell>{project.deadline || "-"}</TableCell>
                <TableCell>
                  <DeleteProjectButton
                    project={project}
                    onDeleted={fetchProjects}
                  />
                  <EditProjectDialog
                    project={project}
                    onUpdated={fetchProjects}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
