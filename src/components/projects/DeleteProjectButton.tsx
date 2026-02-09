"use client";

import { useState } from "react";

import { supabase } from "@/lib/supabase/client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";

import { Trash } from "lucide-react";

import { toast } from "sonner";

export default function DeleteProjectButton({
  project,
  onDeleted,
}: {
  project: any;
  onDeleted: () => void;
}) {

  const [loading, setLoading] = useState(false);


  const deleteProject = async () => {

    setLoading(true);

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    setLoading(false);

    if (error) {

      toast.error(error.message);

      return;

    }

    toast.success("Project deleted");

    onDeleted();

  };


  return (

    <AlertDialog>

      <AlertDialogTrigger asChild>

        <Button size="sm" variant="destructive">

          <Trash className="w-4 h-4 mr-1" />

          Delete

        </Button>

      </AlertDialogTrigger>


      <AlertDialogContent>

        <AlertDialogHeader>

          <AlertDialogTitle>

            Delete project `&quot;{project.name}&quot;`?

          </AlertDialogTitle>

        </AlertDialogHeader>


        <div className="flex justify-end gap-2 mt-4">

          <AlertDialogCancel>

            Cancel

          </AlertDialogCancel>


          <AlertDialogAction
            onClick={deleteProject}
            disabled={loading}
          >

            {loading ? "Deleting..." : "Delete"}

          </AlertDialogAction>

        </div>

      </AlertDialogContent>

    </AlertDialog>

  );

}
