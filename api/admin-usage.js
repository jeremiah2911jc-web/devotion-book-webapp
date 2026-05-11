const SUPABASE_API_BASE = 'https://api.supabase.com/v1';
const DEFAULT_ADMIN_EMAILS = ['allen680552@gmail.com'];
const BYTES_PER_MB = 1024 * 1024;
const USER_PAGE_SIZE = 100;
const USER_PAGE_LIMIT = 10;
const FALLBACK_LIMITS = {
  database: 500 * BYTES_PER_MB,
  storage: 1024 * BYTES_PER_MB,
};

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

function metricNotConfigured(message, missingEnv = []) {
  return {
    status: 'not_configured',
    used: null,
    limit: null,
    percent: null,
    message,
    missingEnv,
  };
}

function metricProviderError(message, error = 'provider_error') {
  return {
    status: error,
    used: null,
    limit: null,
    percent: null,
    message,
  };
}

function usageMetric({ used = null, limit = null, message = '', limitSource = 'configured' } = {}) {
  const usedNumber = typeof used === 'number' && Number.isFinite(used) ? used : null;
  const limitNumber = typeof limit === 'number' && Number.isFinite(limit) && limit > 0 ? limit : null;
  const percent = usedNumber !== null && limitNumber !== null
    ? Math.round((usedNumber / limitNumber) * 100)
    : null;

  return {
    status: 'ok',
    used: usedNumber,
    limit: limitNumber,
    percent,
    limitSource,
    message,
  };
}

function emptyAuthUsers(
  status = 'not_configured',
  message = '缺少 SUPABASE_SERVICE_ROLE_KEY，無法讀取 Auth 使用者統計。',
  missingEnv = status === 'not_configured' ? ['SUPABASE_SERVICE_ROLE_KEY'] : [],
) {
  return {
    status,
    total: 0,
    verified: 0,
    unverified: 0,
    active7d: 0,
    active30d: 0,
    newToday: 0,
    newThisMonth: 0,
    recentUsers: [],
    message,
    missingEnv,
  };
}

function emptySupabaseSection() {
  return {
    database: metricNotConfigured(
      '缺少 SUPABASE_ACCESS_TOKEN，無法透過 Supabase Management API 讀取資料庫大小。',
      ['SUPABASE_ACCESS_TOKEN'],
    ),
    storage: metricNotConfigured(
      '缺少 SUPABASE_ACCESS_TOKEN，無法透過 Supabase Management API 查詢 storage.objects 用量。',
      ['SUPABASE_ACCESS_TOKEN'],
    ),
    authUsers: emptyAuthUsers(),
  };
}

function emptyVercelSection() {
  return {
    deployment: metricNotConfigured(
      '缺少 VERCEL_ACCESS_TOKEN 或 VERCEL_PROJECT_ID，無法讀取 Vercel production deployment 狀態。',
      ['VERCEL_ACCESS_TOKEN', 'VERCEL_PROJECT_ID'],
    ),
  };
}

function buildManualChecks() {
  return {
    supabase: [
      {
        key: 'supabase-egress',
        label: 'Bandwidth / Egress',
        dashboardPath: 'Supabase Dashboard -> Billing / Usage，或 Project Reports -> Custom Reports -> Database API -> API Egress',
        reason: 'Supabase 官方建議從 Billing Dashboard 或 Project Reports 檢視 Egress；目前不放在主監控卡，避免保留永遠 unsupported 的假卡片。',
        warning: '建議低於方案額度 70% 為正常，70% 至 89% 注意，90% 以上警告。',
      },
      {
        key: 'supabase-api-requests',
        label: 'API Requests',
        dashboardPath: 'Supabase Dashboard -> Logs / API 或 Reports',
        reason: 'API request 分析通常來自 Logs / Reports，不適合用目前管理後台做穩定、低成本即時卡片。',
        warning: '若正式站操作變慢或 egress 暴增，再到 Dashboard 檢查 API request 分布。',
      },
      {
        key: 'supabase-error-logs',
        label: 'Logs / Error Logs',
        dashboardPath: 'Supabase Dashboard -> Logs Explorer',
        reason: 'Logs API 需要 analytics/logs 權限與查詢範圍設計，容易回傳大量資料；目前改成人工檢查清單較安全。',
        warning: '發布前後查看 Auth、PostgREST、Storage、Edge Function 是否有連續錯誤。',
      },
    ],
    vercel: [
      {
        key: 'vercel-visitors',
        label: 'Visitors',
        dashboardPath: 'Vercel Dashboard -> Project -> Analytics',
        reason: 'Visitors 屬於 Vercel Web Analytics；需確認專案已啟用 Web Analytics，管理後台不保留沒有資料來源的假卡片。',
        warning: '若需要此數據，先在 Vercel 啟用 Web Analytics，再評估是否接正式 Analytics API。',
      },
      {
        key: 'vercel-bandwidth',
        label: 'Bandwidth',
        dashboardPath: 'Vercel Dashboard -> Usage，或使用具備權限的 Vercel CLI `vercel usage --format json` 人工匯出',
        reason: 'Vercel 用量目前官方穩定入口以 Dashboard / CLI usage 為主；不在前端後台保留長期 not_configured 卡片。',
        warning: '發布初期每日查看流量與費用變化。',
      },
      {
        key: 'vercel-functions',
        label: 'Function Usage',
        dashboardPath: 'Vercel Dashboard -> Usage / Functions',
        reason: 'Function usage 屬帳務用量，需 Dashboard 或 usage 匯出檢查；目前管理後台僅自動讀 deployment 狀態。',
        warning: '若 /api/admin-usage 或收款證明 API 頻率升高，再人工查看 Function usage。',
      },
    ],
  };
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
  return { ok: true };
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
      logUsage(`${label} query failed`, { status: response.status });
      if (response.status === 401) return { payload: null, error: 'unauthorized' };
      if (response.status === 403) return { payload: null, error: 'forbidden' };
      if (response.status === 408 || response.status === 429) return { payload: null, error: 'timeout' };
      return { payload: null, error: 'provider_error' };
    }

    const payload = await response.json().catch(() => null);
    return { payload, error: null };
  } catch (error) {
    if (error?.name === 'AbortError' || error === 'timeout') {
      logUsage(`${label} query timeout`);
      return { payload: null, error: 'timeout' };
    }
    logUsage(`${label} query error`, error?.message || String(error));
    return { payload: null, error: 'provider_error' };
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

function buildReadOnlyQueryError(label, error) {
  if (error === 'unauthorized' || error === 'forbidden') {
    return metricProviderError(
      `SUPABASE_ACCESS_TOKEN 權限不足，無法透過 Management API read-only query 讀取 ${label}。`,
      'forbidden',
    );
  }
  if (error === 'timeout') {
    return metricProviderError(`${label} 查詢逾時，請稍後再試。`, 'timeout');
  }
  return metricProviderError(`${label} 暫時無法自動讀取，請稍後再試。`);
}

async function loadDatabaseSize(projectRef, accessToken) {
  const result = await runReadOnlyQuery(
    projectRef,
    accessToken,
    'select pg_database_size(current_database()) as database_size_bytes;',
    'databaseSize',
  );
  if (result?.error) return buildReadOnlyQueryError('Database Size', result.error);

  const bytes = findFirstNumericField(result?.payload, [
    'database_size_bytes',
    'pg_database_size',
    'size',
  ]);

  if (bytes === null) return metricProviderError('Database Size 查詢有回應，但回傳格式無法解析。');
  return usageMetric({
    used: bytes,
    limit: FALLBACK_LIMITS.database,
    limitSource: 'fallback',
    message: '以 Supabase Management API read-only query 取得目前資料庫大小；上限採保守預設，正式額度仍以 Supabase Dashboard 為準。',
  });
}

async function loadStorageUsed(projectRef, accessToken) {
  const result = await runReadOnlyQuery(
    projectRef,
    accessToken,
    `
      select
        coalesce(sum(
          case
            when metadata ? 'size'
              and (metadata ->> 'size') ~ '^[0-9]+$'
            then (metadata ->> 'size')::bigint
            else 0
          end
        ), 0) as total_bytes
      from storage.objects;
    `,
    'storageUsed',
  );
  if (result?.error) return buildReadOnlyQueryError('Storage 用量', result.error);

  const totalBytes = findFirstNumericField(result?.payload, ['total_bytes']);
  if (totalBytes === null) return metricProviderError('Storage 用量查詢有回應，但回傳格式無法解析。');

  return usageMetric({
    used: totalBytes,
    limit: FALLBACK_LIMITS.storage,
    limitSource: 'fallback',
    message: '以 storage.objects.metadata 的 size 欄位加總估算 Storage 用量；正式帳務用量仍以 Supabase Dashboard 為準。',
  });
}

function parseDate(value) {
  const date = new Date(value || '');
  return Number.isNaN(date.getTime()) ? null : date;
}

function maskEmail(email = '') {
  const normalized = String(email || '').trim().toLowerCase();
  const [name = '', domain = ''] = normalized.split('@');
  if (!name || !domain) return '未顯示';
  const visible = name.length <= 2 ? name.slice(0, 1) : name.slice(0, 2);
  return `${visible}***@${domain}`;
}

function resolveProvider(user = {}) {
  const provider = String(user?.app_metadata?.provider || '').trim();
  if (provider) return provider;
  const identityProvider = Array.isArray(user?.identities)
    ? String(user.identities[0]?.provider || '').trim()
    : '';
  return identityProvider || 'email';
}

function buildActiveLabel(lastSignInAt) {
  const lastSignIn = parseDate(lastSignInAt);
  if (!lastSignIn) return '未活躍';
  const now = Date.now();
  const days = (now - lastSignIn.getTime()) / (24 * 60 * 60 * 1000);
  if (days <= 7) return '7 天內活躍';
  if (days <= 30) return '30 天內活躍';
  return '未活躍';
}

function summarizeAuthUsers(users = []) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const total = users.length;
  const verified = users.filter(user => !!(user?.email_confirmed_at || user?.confirmed_at)).length;
  const active7d = users.filter(user => {
    const lastSignIn = parseDate(user?.last_sign_in_at);
    return lastSignIn && lastSignIn >= sevenDaysAgo;
  }).length;
  const active30d = users.filter(user => {
    const lastSignIn = parseDate(user?.last_sign_in_at);
    return lastSignIn && lastSignIn >= thirtyDaysAgo;
  }).length;
  const newToday = users.filter(user => {
    const createdAt = parseDate(user?.created_at);
    return createdAt && createdAt >= todayStart;
  }).length;
  const newThisMonth = users.filter(user => {
    const createdAt = parseDate(user?.created_at);
    return createdAt && createdAt >= monthStart;
  }).length;

  const recentUsers = [...users]
    .sort((a, b) => {
      const aTime = parseDate(a?.last_sign_in_at)?.getTime() || parseDate(a?.created_at)?.getTime() || 0;
      const bTime = parseDate(b?.last_sign_in_at)?.getTime() || parseDate(b?.created_at)?.getTime() || 0;
      return bTime - aTime;
    })
    .slice(0, 20)
    .map(user => ({
      emailMasked: maskEmail(user?.email),
      verified: !!(user?.email_confirmed_at || user?.confirmed_at),
      createdAt: user?.created_at || null,
      lastSignInAt: user?.last_sign_in_at || null,
      activeLabel: buildActiveLabel(user?.last_sign_in_at),
      provider: resolveProvider(user),
      idPrefix: String(user?.id || '').slice(0, 6),
    }));

  return {
    status: 'ok',
    total,
    verified,
    unverified: Math.max(total - verified, 0),
    active7d,
    active30d,
    newToday,
    newThisMonth,
    recentUsers,
    message: '使用者統計由 server-side Auth Admin API 讀取，前端只收到遮蔽後 Email 與統計數字。',
  };
}

async function loadAuthUsers(projectRef) {
  const serviceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serviceRoleKey) {
    return emptyAuthUsers(
      'not_configured',
      '缺少 SUPABASE_SERVICE_ROLE_KEY，無法讀取 Auth 使用者統計。此 env 必須只設定在 Vercel Production 的 server-side 環境。',
      ['SUPABASE_SERVICE_ROLE_KEY'],
    );
  }

  const users = [];
  for (let page = 1; page <= USER_PAGE_LIMIT; page += 1) {
    const endpoint = `https://${projectRef}.supabase.co/auth/v1/admin/users?page=${page}&per_page=${USER_PAGE_SIZE}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort('timeout'), 10000);
    try {
      const response = await fetch(endpoint, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });
      if (!response.ok) {
        logUsage('auth users query failed', { status: response.status });
        if (response.status === 401 || response.status === 403) {
          return emptyAuthUsers(
            'forbidden',
            'SUPABASE_SERVICE_ROLE_KEY 權限不足或不屬於此專案，無法讀取 Auth 使用者統計。',
            ['SUPABASE_SERVICE_ROLE_KEY'],
          );
        }
        return emptyAuthUsers('provider_error', 'Auth 使用者統計暫時無法讀取，請稍後再試。', []);
      }
      const payload = await response.json().catch(() => null);
      const pageUsers = Array.isArray(payload?.users)
        ? payload.users
        : Array.isArray(payload)
          ? payload
          : [];
      users.push(...pageUsers);
      if (pageUsers.length < USER_PAGE_SIZE) break;
    } catch (error) {
      if (error?.name === 'AbortError' || error === 'timeout') {
        return emptyAuthUsers('timeout', 'Auth 使用者統計讀取逾時，請稍後再試。', []);
      }
      logUsage('auth users query error', error?.message || String(error));
      return emptyAuthUsers('provider_error', 'Auth 使用者統計暫時無法讀取，請稍後再試。', []);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return summarizeAuthUsers(users);
}

async function loadSupabaseUsage(projectRef) {
  const accessToken = String(process.env.SUPABASE_ACCESS_TOKEN || '').trim();
  const authUsersPromise = loadAuthUsers(projectRef).catch((error) => {
    logUsage('auth users fallback', error?.message || String(error));
    return emptyAuthUsers('provider_error', 'Auth 使用者統計暫時無法讀取，請稍後再試。', []);
  });

  if (!accessToken) {
    return {
      ...emptySupabaseSection(),
      authUsers: await authUsersPromise,
    };
  }

  const [database, storage, authUsers] = await Promise.all([
    loadDatabaseSize(projectRef, accessToken),
    loadStorageUsed(projectRef, accessToken),
    authUsersPromise,
  ]);

  return {
    database,
    storage,
    authUsers,
  };
}

function getVercelTeamQuery() {
  const params = new URLSearchParams();
  const teamId = String(process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID || '').trim();
  if (teamId) params.set('teamId', teamId);
  return params.toString();
}

async function loadVercelDeployment() {
  const token = String(process.env.VERCEL_ACCESS_TOKEN || '').trim();
  const projectId = String(process.env.VERCEL_PROJECT_ID || '').trim();
  const missing = [];
  if (!token) missing.push('VERCEL_ACCESS_TOKEN');
  if (!projectId) missing.push('VERCEL_PROJECT_ID');
  if (missing.length) {
    return metricNotConfigured(
      `缺少 ${missing.join('、')}，無法讀取 Vercel production deployment 狀態。若專案屬於 Team，還需要 VERCEL_TEAM_ID。`,
      missing,
    );
  }

  const params = new URLSearchParams({
    projectId,
    limit: '1',
    target: 'production',
  });
  const teamQuery = getVercelTeamQuery();
  if (teamQuery) {
    const teamParams = new URLSearchParams(teamQuery);
    teamParams.forEach((value, key) => params.set(key, value));
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('timeout'), 10000);
  try {
    const response = await fetch(`https://api.vercel.com/v6/deployments?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      logUsage('vercel deployment query failed', { status: response.status });
      if (response.status === 401 || response.status === 403) {
        return metricProviderError(
          'VERCEL_ACCESS_TOKEN 權限不足，或 VERCEL_PROJECT_ID / VERCEL_TEAM_ID 與專案不匹配，無法讀取部署狀態。',
          'forbidden',
        );
      }
      return metricProviderError('Vercel deployment 狀態暫時無法讀取，請稍後再試。');
    }
    const payload = await response.json().catch(() => null);
    const deployment = Array.isArray(payload?.deployments) ? payload.deployments[0] : null;
    if (!deployment) {
      return metricProviderError('目前沒有可讀取的 Vercel production deployment。', 'unknown');
    }
    const state = String(deployment.readyState || deployment.state || 'unknown');
    return {
      status: 'ok',
      value: state,
      message: `最新 production deployment 狀態：${state}。`,
      updatedAt: deployment.createdAt ? new Date(deployment.createdAt).toISOString() : null,
    };
  } catch (error) {
    if (error?.name === 'AbortError' || error === 'timeout') {
      return metricProviderError('Vercel deployment 狀態讀取逾時，請稍後再試。', 'timeout');
    }
    logUsage('vercel deployment query error', error?.message || String(error));
    return metricProviderError('Vercel deployment 狀態暫時無法讀取，請稍後再試。');
  } finally {
    clearTimeout(timeoutId);
  }
}

async function loadVercelUsage() {
  return {
    deployment: await loadVercelDeployment(),
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const userAccessToken = getBearerToken(req);
  if (!userAccessToken) return res.status(401).json({ ok: false, error: 'unauthorized' });

  const projectRef = String(process.env.SUPABASE_PROJECT_REF || '').trim();
  const missingAuthEnv = getMissingAuthEnv(projectRef);
  if (missingAuthEnv.length) {
    logUsage('missing auth env', missingAuthEnv);
    return res.status(503).json({ ok: false, error: 'missing_env', missing: missingAuthEnv });
  }

  const auth = await authorizeAdminRequest(projectRef, userAccessToken);
  if (!auth.ok) return res.status(auth.status).json({ ok: false, error: auth.error });

  try {
    const [supabase, vercel] = await Promise.all([
      loadSupabaseUsage(projectRef),
      loadVercelUsage(),
    ]);

    return res.status(200).json({
      ok: true,
      updatedAt: new Date().toISOString(),
      supabase,
      vercel,
      manualChecks: buildManualChecks(),
    });
  } catch (error) {
    logUsage('handler fallback', error?.message || String(error));
    return res.status(200).json({
      ok: true,
      updatedAt: new Date().toISOString(),
      supabase: emptySupabaseSection(),
      vercel: emptyVercelSection(),
      manualChecks: buildManualChecks(),
    });
  }
}
