"use client";

import { useState } from "react";

import { supabase } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Trash } from "lucide-react";

import { toast } from "sonner";

export default function DeleteClientButton({
  clientId,
  clientName,
  onDeleted,
}: {
  clientId: string;
  clientName: string;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const deleteClient = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", clientId);

    setLoading(false);

    if (error) {
      toast.error(error.message);

      return;
    }

    toast.success("Client deleted");

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
          <AlertDialogTitle>Delete Client?</AlertDialogTitle>

          <AlertDialogDescription>
            This will permanently delete <strong>{clientName}</strong>.
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={deleteClient}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
