import { readFile } from 'node:fs/promises';

const appSource = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const supabaseUrl = appSource.match(/supabaseUrl:\s*'([^']+)'/)?.[1];
const publishableKey = appSource.match(/supabaseAnonKey:\s*'([^']+)'/)?.[1];

if (!supabaseUrl || !publishableKey) {
  throw new Error('Supabase URL or publishable key is missing from app.js.');
}

const endpoint = new URL('/rest/v1/rpc/project_keepalive', supabaseUrl);
if (endpoint.protocol !== 'https:' || !endpoint.hostname.endsWith('.supabase.co')) {
  throw new Error('Refusing to call an unexpected Supabase endpoint.');
}

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    apikey: publishableKey,
    Authorization: `Bearer ${publishableKey}`,
    'Content-Type': 'application/json',
  },
  body: '{}',
  signal: AbortSignal.timeout(20_000),
});

const payload = await response.json().catch(() => null);
if (!response.ok || payload?.ok !== true) {
  throw new Error(`Supabase keepalive failed with HTTP ${response.status}.`);
}

console.log(`Supabase keepalive succeeded at ${payload.checked_at}.`);
