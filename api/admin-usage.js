const SUPABASE_API_BASE = 'https://api.supabase.com/v1';

function emptyUsage() {
  return {
    databaseSize: null,
    databaseLimit: null,
    storageUsed: null,
    storageLimit: null,
    egressUsed: null,
    egressLimit: null,
  };
}

async function fetchManagementJson(path, accessToken) {
  const response = await fetch(`${SUPABASE_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) return null;

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function collectNumbers(value, trail = [], bucket = []) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    bucket.push({ path: trail.join('.').toLowerCase(), value });
    return bucket;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectNumbers(item, [...trail, String(index)], bucket));
    return bucket;
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, nested]) => collectNumbers(nested, [...trail, key], bucket));
  }

  return bucket;
}

function pickMetric(numbers, includes = [], excludes = []) {
  const hit = numbers.find((entry) => (
    includes.every((token) => entry.path.includes(token))
    && excludes.every((token) => !entry.path.includes(token))
  ));
  return hit?.value ?? null;
}

function extractDatabaseMetrics(payloads = []) {
  const numbers = payloads.flatMap((payload) => collectNumbers(payload));
  return {
    databaseSize: pickMetric(numbers, ['database', 'size'], ['limit', 'quota']) ?? pickMetric(numbers, ['db', 'size'], ['limit', 'quota']),
    databaseLimit: pickMetric(numbers, ['database', 'limit']) ?? pickMetric(numbers, ['database', 'quota']) ?? pickMetric(numbers, ['disk', 'size'], ['used']),
  };
}

function extractStorageMetrics(payloads = []) {
  const numbers = payloads.flatMap((payload) => collectNumbers(payload));
  return {
    storageUsed: pickMetric(numbers, ['storage', 'used']) ?? pickMetric(numbers, ['storage', 'size'], ['limit', 'quota']),
    storageLimit: pickMetric(numbers, ['storage', 'limit']) ?? pickMetric(numbers, ['storage', 'quota']),
  };
}

function extractEgressMetrics(payloads = []) {
  const numbers = payloads.flatMap((payload) => collectNumbers(payload));
  return {
    egressUsed: pickMetric(numbers, ['egress', 'used']) ?? pickMetric(numbers, ['egress'], ['limit', 'quota']),
    egressLimit: pickMetric(numbers, ['egress', 'limit']) ?? pickMetric(numbers, ['egress', 'quota']),
  };
}

async function loadSupabaseUsage(accessToken, projectRef) {
  const databasePayloads = await Promise.all([
    fetchManagementJson(`/projects/${projectRef}/analytics/endpoints/usage.db-size`, accessToken),
    fetchManagementJson(`/projects/${projectRef}/analytics/endpoints/usage.database-size`, accessToken),
    fetchManagementJson(`/projects/${projectRef}/analytics/endpoints/usage.disk-size`, accessToken),
    fetchManagementJson(`/projects/${projectRef}`, accessToken),
  ]);

  const storagePayloads = await Promise.all([
    fetchManagementJson(`/projects/${projectRef}/analytics/endpoints/usage.storage-size`, accessToken),
    fetchManagementJson(`/projects/${projectRef}/analytics/endpoints/usage.storage`, accessToken),
    fetchManagementJson(`/projects/${projectRef}`, accessToken),
  ]);

  const egressPayloads = await Promise.all([
    fetchManagementJson(`/projects/${projectRef}/analytics/endpoints/usage.egress`, accessToken),
    fetchManagementJson(`/projects/${projectRef}/analytics/endpoints/usage.api-counts`, accessToken),
    fetchManagementJson(`/projects/${projectRef}`, accessToken),
  ]);

  const database = extractDatabaseMetrics(databasePayloads.filter(Boolean));
  const storage = extractStorageMetrics(storagePayloads.filter(Boolean));
  const egress = extractEgressMetrics(egressPayloads.filter(Boolean));

  return {
    databaseSize: database.databaseSize,
    databaseLimit: database.databaseLimit,
    storageUsed: storage.storageUsed,
    storageLimit: storage.storageLimit,
    egressUsed: egress.egressUsed,
    egressLimit: egress.egressLimit,
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
    return res.status(200).json(emptyUsage());
  }

  try {
    const usage = await loadSupabaseUsage(accessToken, projectRef);
    return res.status(200).json({
      databaseSize: usage.databaseSize ?? null,
      databaseLimit: usage.databaseLimit ?? null,
      storageUsed: usage.storageUsed ?? null,
      storageLimit: usage.storageLimit ?? null,
      egressUsed: usage.egressUsed ?? null,
      egressLimit: usage.egressLimit ?? null,
    });
  } catch {
    return res.status(200).json(emptyUsage());
  }
}
