"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LogoutButton() {

  const router = useRouter();

  function handleLogout() {

    // remove auth
    localStorage.removeItem("parapixel_auth");

    // redirect to login
    router.push("/login");

    // force reload to clear state
    router.refresh();

  }

  return (

    <Button
      variant="destructive"
      size="sm"
      onClick={handleLogout}
    >
      Logout
    </Button>

  );

}
