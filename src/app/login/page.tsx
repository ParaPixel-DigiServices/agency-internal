"use client";

import { useState } from "react";
import { login } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogin() {
    setLoading(true);
    setError("");

    const result = await login(secret);

    if (!result.success) {
      setError(result.error || "Wrong secret word");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleLogin();
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 flex flex-col items-center pb-4">
          <Image
            src="/logo.svg"
            alt="ParaPixel Logo"
            width={80}
            height={80}
            className="mb-2 invert"
          />
          <h1 className="text-2xl font-bold text-center">ParaPixel Internal</h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter your secret to access the admin dashboard
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Enter secret word"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <Button onClick={handleLogin} className="w-full" disabled={loading}>
            {loading ? "Authenticating..." : "Enter"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
