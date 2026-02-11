"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(
    new Set(),
  );

  const toggleDescriptionExpansion = (projectId: string) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

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
      if (process.env.NODE_ENV === "development") {
        console.error(projectsError);
      }
      setLoading(false);
      return;
    }

    // Fetch payments
    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select("project_id, amount");

    if (paymentsError) {
      if (process.env.NODE_ENV === "development") {
        console.error(paymentsError);
      }
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
        <div className="space-y-3">
          <div className="flex gap-4 border-b pb-2">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-24" />
            ))}
          </div>
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
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
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {projects.map((project) => {
              const isExpanded = expandedDescriptions.has(project.id);
              const description = project.description || "";
              const lineCount = description.split("\n").length;
              const charCount = description.length;

              // Show collapse if more than 50 chars OR more than 2 lines
              const shouldCollapse = charCount > 50 || lineCount > 2;

              // For collapsed view: take first 2 lines or 50 chars, whichever is shorter
              let truncatedDescription = description;
              if (shouldCollapse && !isExpanded) {
                const firstTwoLines = description
                  .split("\n")
                  .slice(0, 2)
                  .join("\n");
                if (charCount > 50) {
                  truncatedDescription = description.substring(0, 50);
                } else {
                  truncatedDescription = firstTwoLines;
                }
                if (truncatedDescription !== description) {
                  truncatedDescription += "...";
                }
              }

              return (
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

                  <TableCell className="max-w-xs">
                    {description ? (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {isExpanded ? description : truncatedDescription}
                        </p>
                        {shouldCollapse && (
                          <button
                            onClick={() =>
                              toggleDescriptionExpansion(project.id)
                            }
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3 h-3" />
                                Collapse
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" />
                                Expand
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>

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
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
