const SUPABASE_API_BASE = 'https://api.supabase.com/v1';
const ADMIN_EMAILS = ['allen680552@gmail.com'];

const TABLE_QUERIES = {
  devotion_notes: 'select * from public.devotion_notes order by updated_at desc nulls last, created_at desc nulls last;',
  book_projects: 'select * from public.book_projects order by updated_at desc nulls last, created_at desc nulls last;',
  library_books: 'select * from public.library_books order by updated_at desc nulls last, created_at desc nulls last;',
  library_book_chapters: 'select * from public.library_book_chapters order by book_id asc, chapter_order asc, created_at asc nulls last;',
};

function emptyDbBackup() {
  return {
    devotion_notes: [],
    book_projects: [],
    library_books: [],
    library_book_chapters: [],
  };
}

function logSystemBackup(message, extra = null) {
  if (extra === null || typeof extra === 'undefined') {
    console.log(`[system-backup] ${message}`);
    return;
  }
  console.log(`[system-backup] ${message}`, extra);
}

function getBearerToken(req) {
  const header = String(req.headers?.authorization || '');
  if (!header.toLowerCase().startsWith('bearer ')) return '';
  return header.slice(7).trim();
}

async function verifyAdminUser(projectRef, accessToken) {
  const endpoint = `https://${projectRef}.supabase.co/auth/v1/user`;
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (response.status === 401 || response.status === 403) {
    return { status: 401, user: null };
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`auth verify failed (${response.status}): ${errorText || 'no response body'}`);
  }

  const user = await response.json().catch(() => null);
  const email = String(user?.email || '').trim().toLowerCase();
  if (!email) return { status: 401, user: null };
  if (!ADMIN_EMAILS.includes(email)) return { status: 403, user };
  return { status: 200, user };
}

async function runReadOnlyQuery(projectRef, accessToken, query, label) {
  const endpoint = `${SUPABASE_API_BASE}/projects/${projectRef}/database/query/read-only`;
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
    throw new Error(`${label} query failed (${response.status}): ${errorText || 'no response body'}`);
  }

  return response.json().catch(() => null);
}

function extractRowsFromPayload(payload) {
  if (Array.isArray(payload) && payload.every(item => item && typeof item === 'object' && !Array.isArray(item))) {
    return payload;
  }
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const rows = extractRowsFromPayload(item);
      if (rows.length) return rows;
    }
    return [];
  }
  if (payload && typeof payload === 'object') {
    for (const value of Object.values(payload)) {
      const rows = extractRowsFromPayload(value);
      if (rows.length) return rows;
    }
  }
  return [];
}

async function loadTable(projectRef, accessToken, tableName, query) {
  try {
    const payload = await runReadOnlyQuery(projectRef, accessToken, query, tableName);
    const rows = extractRowsFromPayload(payload);
    logSystemBackup(`${tableName} loaded`, { rows: rows.length });
    return rows;
  } catch (error) {
    logSystemBackup(`${tableName} failed`, error?.message || String(error));
    return [];
  }
}

async function loadDbBackup(projectRef, accessToken) {
  const entries = await Promise.all(
    Object.entries(TABLE_QUERIES).map(async ([tableName, query]) => [tableName, await loadTable(projectRef, accessToken, tableName, query)]),
  );
  return Object.fromEntries(entries);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ dbBackup: emptyDbBackup() });
  }

  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF;
  const userAccessToken = getBearerToken(req);

  if (!userAccessToken) {
    logSystemBackup('missing bearer token');
    return res.status(401).json({ error: 'unauthorized', dbBackup: emptyDbBackup() });
  }

  if (!accessToken || !projectRef) {
    logSystemBackup('missing SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF');
    return res.status(500).json({ error: 'server_misconfigured', dbBackup: emptyDbBackup() });
  }

  try {
    const authCheck = await verifyAdminUser(projectRef, userAccessToken);
    if (authCheck.status === 401) {
      logSystemBackup('invalid or expired user token');
      return res.status(401).json({ error: 'unauthorized', dbBackup: emptyDbBackup() });
    }
    if (authCheck.status === 403) {
      logSystemBackup('non-admin blocked', { email: authCheck.user?.email || '' });
      return res.status(403).json({ error: 'forbidden', dbBackup: emptyDbBackup() });
    }
    const dbBackup = await loadDbBackup(projectRef, accessToken);
    return res.status(200).json({ dbBackup });
  } catch (error) {
    logSystemBackup('handler fallback to empty db backup', error?.message || String(error));
    return res.status(200).json({ dbBackup: emptyDbBackup() });
  }
}
