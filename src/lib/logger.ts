/**
 * RADF v3 — Structured Logger
 * JSON-formatted logs for production. Human-readable in development.
 * Never logs sensitive data (passwords, private keys, tokens).
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  [key: string]: unknown;
}

const isDev = process.env.NODE_ENV !== 'production';
const SERVICE = process.env.LOG_SERVICE ?? 'glitched-web';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: SERVICE,
    ...sanitize(meta),
  };

  if (isDev) {
    // Human-readable in development
    const color = { debug: '\x1b[36m', info: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m' }[level];
    const reset = '\x1b[0m';
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    console[level === 'debug' ? 'log' : level](`${color}[${level.toUpperCase()}]${reset} ${message}${metaStr}`);
  } else {
    // JSON in production (for log aggregators like Loki/Datadog)
    console[level === 'debug' ? 'log' : level](JSON.stringify(entry));
  }
}

/** Remove sensitive fields from log metadata */
function sanitize(meta?: Record<string, unknown>): Record<string, unknown> {
  if (!meta) return {};
  const SENSITIVE_KEYS = ['password', 'privateKey', 'secret', 'token', 'apiKey', 'signature', 'seed'];
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = value;
    }
  }
  return result;
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),

  /** Log an API request */
  request: (method: string, path: string, status: number, durationMs: number, userId?: string) => {
    log('info', `${method} ${path} ${status}`, { method, path, status, durationMs, userId });
  },

  /** Log a game engine event */
  engine: (event: string, matchId: string, meta?: Record<string, unknown>) => {
    log('info', `[ENGINE] ${event}`, { matchId, ...meta });
  },

  /** Log a Solana transaction */
  solana: (event: string, signature?: string, meta?: Record<string, unknown>) => {
    log('info', `[SOLANA] ${event}`, { signature, ...meta });
  },
};
