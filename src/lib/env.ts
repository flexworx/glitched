/**
 * RADF v3 — Environment Variable Validation
 * Validates all required env vars at startup.
 * Fails fast with a clear error message rather than cryptic runtime errors.
 *
 * Import this at the top of any server-side entry point.
 */

interface EnvVar {
  key: string;
  required: boolean;
  secret?: boolean;
  description: string;
}

const ENV_VARS: EnvVar[] = [
  // ─── Required ─────────────────────────────────────────────────────────────
  { key: 'DATABASE_URL', required: true, secret: true, description: 'PostgreSQL connection string' },
  { key: 'NEXTAUTH_SECRET', required: true, secret: true, description: 'NextAuth.js session secret (min 32 chars)' },
  { key: 'NEXTAUTH_URL', required: true, description: 'Full URL of the app (e.g. https://glitched.gg)' },
  { key: 'ANTHROPIC_API_KEY', required: true, secret: true, description: 'Anthropic Claude API key' },

  // ─── Optional but recommended ─────────────────────────────────────────────
  { key: 'NEXT_PUBLIC_APP_URL', required: false, description: 'Public app URL for client-side links' },
  { key: 'NEXT_PUBLIC_WS_URL', required: false, description: 'WebSocket server URL' },
  { key: 'SOLANA_RPC_URL', required: false, description: 'Solana mainnet RPC endpoint' },
  { key: 'PLATFORM_WALLET_PRIVATE_KEY', required: false, secret: true, description: 'Solana platform wallet private key' },
  { key: 'ELEVENLABS_API_KEY', required: false, secret: true, description: 'ElevenLabs voice synthesis API key' },
  { key: 'REDIS_URL', required: false, description: 'Redis connection URL for WebSocket pub/sub' },
  { key: 'CRON_SECRET', required: false, secret: true, description: 'Secret token for cron job authorization' },
  { key: 'ADMIN_SECRET', required: false, secret: true, description: 'Admin panel secret key' },
];

/**
 * Validate all environment variables.
 * Call this once at app startup.
 * Returns a list of validation errors (empty = all good).
 */
export function validateEnv(): string[] {
  const errors: string[] = [];

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.key];

    if (envVar.required && !value) {
      errors.push(`Missing required env var: ${envVar.key} — ${envVar.description}`);
      continue;
    }

    // Validate NEXTAUTH_SECRET length
    if (envVar.key === 'NEXTAUTH_SECRET' && value && value.length < 32) {
      errors.push(`NEXTAUTH_SECRET must be at least 32 characters (got ${value.length})`);
    }

    // Warn if DATABASE_URL points to localhost in production
    if (envVar.key === 'DATABASE_URL' && value && process.env.NODE_ENV === 'production') {
      if (value.includes('localhost') && !value.includes('host.docker.internal')) {
        errors.push('DATABASE_URL contains "localhost" in production — use host.docker.internal or a remote host');
      }
    }
  }

  return errors;
}

/**
 * Assert all required env vars are present.
 * Throws with a clear error message if any are missing.
 * Call at the top of server entry points.
 */
export function assertEnv(): void {
  const errors = validateEnv();
  if (errors.length > 0) {
    const message = [
      '❌ Environment variable validation failed:',
      ...errors.map(e => `  • ${e}`),
      '',
      'Copy .env.example to .env.local and fill in all required values.',
    ].join('\n');
    throw new Error(message);
  }
}

/**
 * Safe getter — returns the env var or a default value.
 * Never throws. Use for optional config.
 */
export function getEnv(key: string, defaultValue = ''): string {
  return process.env[key] ?? defaultValue;
}

/**
 * Required getter — throws if the env var is missing.
 * Use for values that must exist at runtime.
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable "${key}" is not set`);
  }
  return value;
}
