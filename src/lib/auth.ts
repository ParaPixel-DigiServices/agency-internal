export const AUTH_SECRET = "yuckfou";

export function isAuthenticated() {
  if (typeof window === "undefined") return false;

  return localStorage.getItem("parapixel_auth") === AUTH_SECRET;
}

export function login(secret: string) {
  if (secret === AUTH_SECRET) {
    localStorage.setItem("parapixel_auth", AUTH_SECRET);
    return true;
  }

  return false;
}

export function logout() {
  localStorage.removeItem("parapixel_auth");
}
