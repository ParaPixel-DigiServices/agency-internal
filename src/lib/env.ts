// Environment variable validation
// Run this at app startup to ensure all required env vars are present

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "BROWSERLESS_URL",
] as const;

const optionalEnvVars = [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
] as const;

export function validateEnv() {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Check optional but recommended variables
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(envVar);
    }
  }

  // Throw error if required vars are missing
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join("\n")}\n\n` +
        `Please add these to your .env file. See .env.example for reference.`
    );
  }

  // Warn about optional vars
  if (warnings.length > 0 && process.env.NODE_ENV === "development") {
    console.warn(
      `⚠️  Optional environment variables not set:\n${warnings.join("\n")}\n` +
        `Some features may not work without these.`
    );
  }

  // Validate URL formats
  const urlVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "BROWSERLESS_URL",
    "UPSTASH_REDIS_REST_URL",
  ];

  for (const envVar of urlVars) {
    const value = process.env[envVar];
    if (value && !isValidUrl(value)) {
      throw new Error(
        `Invalid URL format for ${envVar}: ${value}\n` +
          `Must be a valid HTTP, HTTPS, WS, or WSS URL.`
      );
    }
  }

  return true;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:", "ws:", "wss:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Auto-validate on import in development
if (process.env.NODE_ENV === "development") {
  try {
    validateEnv();
  } catch (error) {
    if (error instanceof Error) {
      console.error("\n❌ Environment validation failed:\n");
      console.error(error.message);
      console.error("\n");
    }
  }
}
