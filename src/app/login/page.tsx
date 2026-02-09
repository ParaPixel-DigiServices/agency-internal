"use client";

import { useState } from "react";
import { login } from "@/lib/auth";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {

  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  function handleLogin() {

    const ok = login(secret);

    if (!ok) {
      setError("Wrong secret word");
      return;
    }

    router.push("/dashboard");
  }

  return (

    <div className="flex items-center justify-center h-screen">

      <div className="w-[400px] space-y-4">

        <h1 className="text-2xl font-bold">
          ParaPixel Internal
        </h1>

        <Input
          type="password"
          placeholder="Enter secret word"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleLogin}
          className="w-full"
        >
          Enter
        </Button>

      </div>

    </div>

  );

}
