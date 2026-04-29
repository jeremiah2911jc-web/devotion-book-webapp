const SUPABASE_API_BASE = 'https://api.supabase.com/v1';
const DEFAULT_ADMIN_EMAILS = ['allen680552@gmail.com'];
const BYTES_PER_MB = 1024 * 1024;
const FALLBACK_LIMITS_MB = {
  databaseLimit: 500,
  storageLimit: 1024,
  egressLimit: 5120,
};

function emptyUsage() {
  return {
    database: {
      used: null,
      limit: FALLBACK_LIMITS_MB.databaseLimit,
      error: null,
    },
    storage: {
      used: null,
      limit: FALLBACK_LIMITS_MB.storageLimit,
      error: null,
    },
    egress: {
      used: null,
      limit: FALLBACK_LIMITS_MB.egressLimit,
      error: null,
    },
  };
}

function logUsage(message, extra = null) {
  if (extra === null || typeof extra === 'undefined') {
    console.log(`[admin-usage] ${message}`);
    return;
  }
  console.log(`[admin-usage] ${message}`, extra);
}

function getAdminEmailSet() {
  const configured = String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
  return new Set(configured.length ? configured : DEFAULT_ADMIN_EMAILS);
}

function getBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

function getMissingAuthEnv(projectRef) {
  const missing = [];
  if (!String(projectRef || '').trim()) missing.push('SUPABASE_PROJECT_REF');
  if (!String(process.env.SUPABASE_ANON_KEY || '').trim()) missing.push('SUPABASE_ANON_KEY');
  return missing;
}

async function verifySupabaseUser(projectRef, accessToken) {
  const anonKey = String(process.env.SUPABASE_ANON_KEY || '').trim();
  const response = await fetch(`https://${projectRef}.supabase.co/auth/v1/user`, {
    headers: {
      Accept: 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) return null;
  return response.json().catch(() => null);
}

async function authorizeAdminRequest(projectRef, accessToken) {
  const user = await verifySupabaseUser(projectRef, accessToken).catch((error) => {
    logUsage('auth verification failed', error?.message || String(error));
    return null;
  });
  const email = String(user?.email || '').trim().toLowerCase();
  if (!email) return { ok: false, status: 401, error: 'unauthorized' };
  if (!getAdminEmailSet().has(email)) return { ok: false, status: 403, error: 'forbidden' };
  return { ok: true, userEmail: email };
}

function bytesToMb(value) {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return null;
  return Number((number / BYTES_PER_MB).toFixed(2));
}

async function runReadOnlyQuery(projectRef, accessToken, query, label) {
  const endpoint = `${SUPABASE_API_BASE}/projects/${projectRef}/database/query/read-only`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('timeout'), 10000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      logUsage(`${label} query failed (${response.status})`, errorText || 'no response body');
      if (response.status === 401 || response.status === 403) return { payload: null, error: 'unauthorized' };
      if (response.status >= 500) return { payload: null, error: 'server_error' };
      return { payload: null, error: 'query_error' };
    }

    const payload = await response.json().catch(() => null);
    return { payload, error: null };
  } catch (error) {
    if (error?.name === 'AbortError' || error === 'timeout') {
      logUsage(`${label} query timeout`);
      return { payload: null, error: 'timeout' };
    }
    logUsage(`${label} query error`, error?.message || String(error));
    return { payload: null, error: 'unknown' };
  } finally {
    clearTimeout(timeoutId);
  }
}

function collectPrimitiveRows(value, bucket = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectPrimitiveRows(item, bucket));
    return bucket;
  }

  if (value && typeof value === 'object') {
    const primitiveEntries = Object.entries(value).filter(([, nested]) => (
      ['string', 'number', 'boolean'].includes(typeof nested) || nested === null
    ));
    if (primitiveEntries.length) {
      bucket.push(Object.fromEntries(primitiveEntries));
    }
    Object.values(value).forEach((nested) => collectPrimitiveRows(nested, bucket));
  }

  return bucket;
}

function findFirstNumericField(payload, candidateKeys = []) {
  const rows = collectPrimitiveRows(payload);
  const normalizedKeys = candidateKeys.map((key) => key.toLowerCase());

  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (!normalizedKeys.includes(String(key).toLowerCase())) continue;
      const numeric = typeof value === 'number' ? value : Number(value);
      if (Number.isFinite(numeric)) return numeric;
    }
  }

  return null;
}

async function loadDatabaseSize(projectRef, accessToken) {
  const result = await runReadOnlyQuery(
    projectRef,
    accessToken,
    'select pg_database_size(current_database()) as database_size_bytes;',
    'databaseSize',
  );
  if (result?.error) return { used: null, error: result.error };
  const payload = result?.payload;

  const bytes = findFirstNumericField(payload, [
    'database_size_bytes',
    'pg_database_size',
    'size',
  ]);

  if (bytes === null) {
    logUsage('databaseSize unresolved from read-only query');
    return { used: null, error: 'unknown' };
  }

  const megabytes = bytesToMb(bytes);
  logUsage('databaseSize resolved', { usedMb: megabytes });
  return { used: megabytes, error: null };
}

async function loadStorageUsed(projectRef, accessToken) {
  const result = await runReadOnlyQuery(
    projectRef,
    accessToken,
    `
      select
        sum(size) as total_bytes
      from storage.objects;
    `,
    'storageUsed',
  );
  if (result?.error) return { used: null, error: result.error };
  const payload = result?.payload;

  const totalBytes = findFirstNumericField(payload, ['total_bytes']);
  if (totalBytes === null) {
    const rows = collectPrimitiveRows(payload);
    const hasNullTotal = rows.some((row) => Object.prototype.hasOwnProperty.call(row, 'total_bytes') && row.total_bytes === null);
    if (hasNullTotal) {
      logUsage('storageUsed resolved', { usedMb: 0 });
      return { used: 0, error: null };
    }
    logUsage('storageUsed unresolved: missing total_bytes');
    return { used: null, error: 'unknown' };
  }

  const megabytes = bytesToMb(totalBytes);
  logUsage('storageUsed resolved', { usedMb: megabytes });
  return { used: megabytes, error: null };
}

async function loadSupabaseUsage(accessToken, projectRef) {
  const [database, storage] = await Promise.all([
    loadDatabaseSize(projectRef, accessToken).catch((error) => {
      logUsage('database usage fallback', error?.message || String(error));
      return { used: null, error: 'unknown' };
    }),
    loadStorageUsed(projectRef, accessToken).catch((error) => {
      logUsage('storage usage fallback', error?.message || String(error));
      return { used: null, error: 'unknown' };
    }),
  ]);

  return {
    database: {
      used: database?.used ?? null,
      limit: FALLBACK_LIMITS_MB.databaseLimit,
      error: database?.error ?? null,
    },
    storage: {
      used: storage?.used ?? null,
      limit: FALLBACK_LIMITS_MB.storageLimit,
      error: storage?.error ?? null,
    },
    egress: {
      used: null,
      limit: FALLBACK_LIMITS_MB.egressLimit,
      error: null,
    },
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json(emptyUsage());
  }

  const userAccessToken = getBearerToken(req);
  if (!userAccessToken) return res.status(401).json({ error: 'unauthorized' });

  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF;
  const missingAuthEnv = getMissingAuthEnv(projectRef);

  if (missingAuthEnv.length) {
    logUsage('missing auth env', missingAuthEnv);
    return res.status(500).json({ error: 'missing_env', missing: missingAuthEnv });
  }

  const auth = await authorizeAdminRequest(projectRef, userAccessToken);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  if (!accessToken || !projectRef) {
    logUsage('missing SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF');
    return res.status(200).json(emptyUsage());
  }

  try {
    const usage = await loadSupabaseUsage(accessToken, projectRef);
    logUsage('usage summary', usage);
    return res.status(200).json(usage);
  } catch (error) {
    logUsage('handler fallback to empty usage', error?.message || String(error));
    return res.status(200).json(emptyUsage());
  }
}
