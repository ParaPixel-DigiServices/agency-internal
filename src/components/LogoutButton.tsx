"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    await supabase.auth.signOut();

    // Force full page reload to clear all state
    window.location.href = "/login";
  }

  return (
    <Button
      variant="destructive"
      onClick={handleLogout}
      disabled={loading}
      className="w-full"
    >
      {loading ? "Logging out..." : "Logout"}
    </Button>
  );
}
