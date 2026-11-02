/**
 * Runtime .env loader for the standalone production server.
 *
 * `next dev` and `next build` load .env files natively, but when the site is
 * run from the standalone bundle (node .next/standalone/server.js) the file
 * location depends on where the process was started from. This loader merges
 * a project .env into process.env on first use, searching the usual
 * locations. Real environment variables always win over file values, so
 * platform-provided config (PORT etc.) is never overridden.
 *
 * Values are read lazily at request time — nothing is baked in at build
 * time — so editing .env and restarting the server is all it takes.
 */
import fs from 'fs';
import path from 'path';

let loaded = false;

function candidatePaths(): string[] {
  const cwd = process.cwd();
  return [
    path.join(cwd, '.env'),
    path.resolve(cwd, '..', '.env'), // .next/standalone -> .next
    path.resolve(cwd, '..', '..', '.env'), // .next/standalone -> project root
    path.resolve(cwd, '..', '..', '..', '.env'), // .next/standalone/<site> -> project root
  ];
}

function parseEnvFile(text: Record<string, string> | string): Record<string, string> {
  const out: Record<string, string> = {};
  const lines = String(text).split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // Strip matching surrounding quotes.
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

/** Load and merge .env files once per process. Exposed for tests. */
export function loadEnv(): void {
  if (loaded) return;
  loaded = true;
  for (const p of candidatePaths()) {
    let text: string;
    try {
      text = fs.readFileSync(p, 'utf8');
    } catch {
      continue;
    }
    const values = parseEnvFile(text);
    for (const [key, value] of Object.entries(values)) {
      const current = process.env[key];
      // Shell-provided values always win; empty file values never occupy a
      // key so a later candidate (e.g. the project .env with real values)
      // can still fill it.
      if (current === undefined && value !== '') process.env[key] = value;
    }
    console.log(`[env] loaded ${Object.keys(values).length} key(s) from ${p}`);
  }
}

/** Read a config value (env var first, .env fallback via loadEnv). */
export function envValue(key: string): string {
  loadEnv();
  return process.env[key] ?? '';
}
