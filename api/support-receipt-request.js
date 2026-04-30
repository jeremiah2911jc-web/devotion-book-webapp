const SUPPORT_RECEIPT_TO_EMAIL = process.env.SUPPORT_RECEIPT_TO_EMAIL || 'devotionbook.tw@gmail.com';
const MAX_NOTE_LENGTH = 1000;

function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

function normalizeString(value) {
  return String(value || '').trim();
}

async function readRequestBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function normalizeRequestPayload(body = {}) {
  return {
    name: normalizeString(body.name),
    email: normalizeString(body.email).toLowerCase(),
    amount: Number(body.amount),
    transferDate: normalizeString(body.transferDate),
    bankLast5: normalizeString(body.bankLast5),
    note: normalizeString(body.note),
  };
}

function validateSupportReceiptRequest(input) {
  if (!input.name) return 'name_required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return 'invalid_email';
  if (!Number.isFinite(input.amount) || input.amount <= 0) return 'invalid_amount';
  if (!input.transferDate) return 'transfer_date_required';
  if (!/^\d{5}$/.test(input.bankLast5)) return 'invalid_bank_last5';
  if (input.note.length > MAX_NOTE_LENGTH) return 'note_too_long';
  return '';
}

function formatAmount(amount) {
  return Number(amount).toLocaleString('zh-TW', {
    maximumFractionDigits: 0,
  });
}

async function readResendErrorResponse(response) {
  try {
    return await response.clone().json();
  } catch (jsonError) {
    return response.text().catch(() => '');
  }
}

function summarizeSupportReceiptRequest(input) {
  return {
    fields: ['name', 'email', 'amount', 'transferDate', 'bankLast5', 'note'],
    hasName: !!input.name,
    emailDomain: input.email.includes('@') ? input.email.split('@').pop() : '',
    amount: input.amount,
    transferDate: input.transferDate,
    bankLast5Length: input.bankLast5.length,
    noteLength: input.note.length,
  };
}

function buildSupportReceiptEmailText(input, requestedAt) {
  return [
    '支持款項收款證明申請',
    '',
    `申請時間：${requestedAt}`,
    `姓名或收據抬頭：${input.name}`,
    `Email：${input.email}`,
    `支持金額：NT$ ${formatAmount(input.amount)}`,
    `轉帳日期：${input.transferDate}`,
    `匯款帳號後五碼：${input.bankLast5}`,
    `備註：${input.note || '無'}`,
    '',
    '用途：',
    '支持平台／支持事工，用於內容製作、系統開發、雲端維護與出版功能優化。',
    '',
    '提醒：',
    '本申請需人工核對入帳後，才會寄出支持款項收款證明。',
    '本證明為支持款項收款紀錄，不作為稅務扣抵憑證。',
  ].join('\n');
}

async function sendSupportReceiptEmail(input) {
  const apiKey = normalizeString(process.env.RESEND_API_KEY);
  const fromEmail = normalizeString(process.env.SUPPORT_RECEIPT_FROM_EMAIL);
  const toEmail = normalizeString(SUPPORT_RECEIPT_TO_EMAIL);
  if (!apiKey || !fromEmail || !toEmail) {
    return {
      ok: false,
      status: 503,
      error: 'missing_email_env',
      message: '收款證明申請服務尚未完成寄信設定，請稍後再試。',
    };
  }

  const requestedAt = new Date().toISOString();
  const subject = `【支持款項收款證明申請】${input.name} / NT$ ${formatAmount(input.amount)}`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: input.email,
      subject,
      text: buildSupportReceiptEmailText(input, requestedAt),
    }),
  });

  if (!response.ok) {
    const resendError = await readResendErrorResponse(response);
    console.error('[support-receipt-request] resend failed', {
      status: response.status,
      error: resendError,
      from: fromEmail,
      to: toEmail,
      request: summarizeSupportReceiptRequest(input),
    });
    return {
      ok: false,
      status: 502,
      error: 'email_send_failed',
      message: '收款證明申請送出失敗，請稍後再試，或聯絡 devotionbook.tw@gmail.com。',
    };
  }

  return { ok: true, status: 200 };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  let input;
  try {
    input = normalizeRequestPayload(await readRequestBody(req));
  } catch (error) {
    return sendJson(res, 400, { ok: false, error: 'invalid_json' });
  }

  const validationError = validateSupportReceiptRequest(input);
  if (validationError) {
    return sendJson(res, 400, { ok: false, error: validationError });
  }

  try {
    const result = await sendSupportReceiptEmail(input);
    if (!result.ok) {
      return sendJson(res, result.status || 502, {
        ok: false,
        error: result.error || 'email_send_failed',
        message: result.message || '收款證明申請送出失敗，請稍後再試，或聯絡 devotionbook.tw@gmail.com。',
      });
    }
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error('[support-receipt-request] handler failed', error?.message || String(error));
    return sendJson(res, 502, {
      ok: false,
      error: 'email_send_failed',
      message: '收款證明申請送出失敗，請稍後再試，或聯絡 devotionbook.tw@gmail.com。',
    });
  }
}
