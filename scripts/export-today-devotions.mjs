import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const sourcePath = process.argv[2];
const outputPath = path.join(projectRoot, 'data', 'today-devotions-2026.json');

if (!sourcePath) {
  throw new Error('Usage: node scripts/export-today-devotions.mjs "<path-to-xlsx>"');
}

const preferredPythonCandidates = [
  process.env.CODEX_PYTHON,
  'C:\\Users\\allen\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe',
].filter(candidate => candidate && existsSync(candidate));

const pythonCandidates = preferredPythonCandidates.length
  ? preferredPythonCandidates
  : ['python', 'python3'];

const pythonCode = `
import json
import sys
from datetime import datetime
from openpyxl import load_workbook

path = sys.argv[1]
wb = load_workbook(path, read_only=False, data_only=True)
if '年度資料' not in wb.sheetnames:
    raise SystemExit('Missing sheet: 年度資料')

ws = wb['年度資料']
headers = [cell.value for cell in ws[1]]
expected_headers = [
    '日期', '星期', '月份', '年度階段', '節期/特殊日', '特殊群組', '主題', '金句',
    '短解析', '卡片署名', '是否特殊', 'CSS標籤', '來源/備註'
]
if headers[:len(expected_headers)] != expected_headers:
    raise SystemExit('Unexpected headers in 年度資料')

def stringify(value):
    if value is None:
        return ''
    return str(value).strip()

records = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if not row or row[0] is None:
        continue

    date_value = row[0]
    if not isinstance(date_value, datetime):
        raise SystemExit(f'Unexpected date cell type: {type(date_value).__name__}')

    records.append({
        'date': date_value.strftime('%Y-%m-%d'),
        'month': int(row[2]) if row[2] is not None else None,
        'weekday': stringify(row[1]),
        'title': stringify(row[6]),
        'scripture': '',
        'quote': stringify(row[7]),
        'summary': stringify(row[8]),
        'theme': stringify(row[3]),
        'specialDay': stringify(row[4]),
        'specialGroup': stringify(row[5]),
        'isSpecial': stringify(row[10]) == '是',
        'cssTag': stringify(row[11]),
        'signature': stringify(row[9]),
        'sourceNote': stringify(row[12]),
    })

print(json.dumps(records, ensure_ascii=False, indent=2))
`;

function runPython(pythonCommand) {
  return execFileSync(pythonCommand, ['-X', 'utf8', '-c', pythonCode, sourcePath], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      PYTHONUTF8: '1',
    },
  });
}

let jsonText = '';
let lastError = null;

for (const pythonCommand of pythonCandidates) {
  try {
    jsonText = runPython(pythonCommand);
    if (jsonText.trim()) break;
  } catch (error) {
    lastError = error;
  }
}

if (!jsonText.trim()) {
  throw lastError || new Error('Unable to export today devotions JSON.');
}

const records = JSON.parse(jsonText);
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`, 'utf8');

console.log(`Exported ${records.length} records to ${outputPath}`);
