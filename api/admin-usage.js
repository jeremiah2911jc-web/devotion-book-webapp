const SUPABASE_API_BASE = 'https://api.supabase.com/v1';
const BYTES_PER_MB = 1024 * 1024;
const FALLBACK_LIMITS_MB = {
  databaseLimit: 500,
  storageLimit: 1024,
  egressLimit: 5120,
};

function emptyUsage() {
  return {
    databaseSize: null,
    databaseLimit: FALLBACK_LIMITS_MB.databaseLimit,
    storageUsed: null,
    storageLimit: FALLBACK_LIMITS_MB.storageLimit,
    egressUsed: null,
    egressLimit: FALLBACK_LIMITS_MB.egressLimit,
  };
}

function logUsage(message, extra = null) {
  if (extra === null || typeof extra === 'undefined') {
    console.log(`[admin-usage] ${message}`);
    return;
  }
  console.log(`[admin-usage] ${message}`, extra);
}

function bytesToMb(value) {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return null;
  return Number((number / BYTES_PER_MB).toFixed(2));
}

async function runReadOnlyQuery(projectRef, accessToken, query, label) {
  const endpoint = `${SUPABASE_API_BASE}/projects/${projectRef}/database/query/read-only`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
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
      return null;
    }

    const payload = await response.json().catch(() => null);
    logUsage(`${label} query succeeded`);
    return payload;
  } catch (error) {
    logUsage(`${label} query error`, error?.message || String(error));
    return null;
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
  const payload = await runReadOnlyQuery(
    projectRef,
    accessToken,
    'select pg_database_size(current_database()) as database_size_bytes;',
    'databaseSize',
  );

  const bytes = findFirstNumericField(payload, [
    'database_size_bytes',
    'pg_database_size',
    'size',
  ]);

  if (bytes === null) {
    logUsage('databaseSize unresolved from read-only query');
    return null;
  }

  const megabytes = bytesToMb(bytes);
  logUsage(`databaseSize resolved: ${megabytes} MB`);
  return megabytes;
}

async function loadStorageUsed(projectRef, accessToken) {
  const payload = await runReadOnlyQuery(
    projectRef,
    accessToken,
    `
      select
        sum(size) as total_bytes
      from storage.objects;
    `,
    'storageUsed',
  );

  const totalBytes = findFirstNumericField(payload, ['total_bytes']);
  if (totalBytes === null) {
    const rows = collectPrimitiveRows(payload);
    const hasNullTotal = rows.some((row) => Object.prototype.hasOwnProperty.call(row, 'total_bytes') && row.total_bytes === null);
    if (hasNullTotal) {
      logUsage('storageUsed resolved: 0 MB (no files)');
      return 0;
    }
    logUsage('storageUsed unresolved: missing total_bytes');
    return null;
  }

  const megabytes = bytesToMb(totalBytes);
  logUsage(`storageUsed resolved: ${megabytes} MB`);
  return megabytes;
}

async function loadSupabaseUsage(accessToken, projectRef) {
  const [databaseSize, storageUsed] = await Promise.all([
    loadDatabaseSize(projectRef, accessToken).catch(() => null),
    loadStorageUsed(projectRef, accessToken).catch(() => null),
  ]);

  return {
    databaseSize,
    databaseLimit: FALLBACK_LIMITS_MB.databaseLimit,
    storageUsed,
    storageLimit: FALLBACK_LIMITS_MB.storageLimit,
    egressUsed: null,
    egressLimit: FALLBACK_LIMITS_MB.egressLimit,
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json(emptyUsage());
  }

  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF;

  if (!accessToken || !projectRef) {
    logUsage('missing SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF');
    return res.status(200).json(emptyUsage());
  }

  try {
    const usage = await loadSupabaseUsage(accessToken, projectRef);
    return res.status(200).json({
      databaseSize: usage.databaseSize ?? null,
      databaseLimit: usage.databaseLimit ?? FALLBACK_LIMITS_MB.databaseLimit,
      storageUsed: usage.storageUsed ?? null,
      storageLimit: usage.storageLimit ?? FALLBACK_LIMITS_MB.storageLimit,
      egressUsed: null,
      egressLimit: usage.egressLimit ?? FALLBACK_LIMITS_MB.egressLimit,
    });
  } catch (error) {
    logUsage('handler fallback to empty usage', error?.message || String(error));
    return res.status(200).json(emptyUsage());
  }
}
