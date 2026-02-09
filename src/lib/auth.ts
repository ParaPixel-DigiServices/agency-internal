export function isAuthenticated() {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem("parapixel_auth");
  return token !== null && token.length > 0;
}

export async function login(
  secret: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ secret }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      localStorage.setItem("parapixel_auth", data.token);
      return { success: true };
    }

    return { success: false, error: data.error || "Authentication failed" };
  } catch (error) {
    return { success: false, error: "Network error occurred" };
  }
}

export function logout() {
  localStorage.removeItem("parapixel_auth");
}
