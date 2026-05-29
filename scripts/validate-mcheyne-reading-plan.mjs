import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const planPath = path.join(projectRoot, 'assets', 'data', 'mcheyne-reading-plan.json');

function fail(message) {
  console.error(`mcheyne-reading-plan validation failed: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(planPath)) {
  fail(`missing file: ${path.relative(projectRoot, planPath)}`);
}

let plan;
try {
  plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
} catch (error) {
  fail(`invalid JSON: ${error.message}`);
}

if (!Array.isArray(plan)) fail('root value must be an array');
if (plan.length !== 365) fail(`expected 365 records, got ${plan.length}`);

const expectedMonthDays = new Map([
  [1, 31],
  [2, 28],
  [3, 31],
  [4, 30],
  [5, 31],
  [6, 30],
  [7, 31],
  [8, 31],
  [9, 30],
  [10, 31],
  [11, 30],
  [12, 31],
]);
const seenDates = new Set();

plan.forEach((entry, index) => {
  if (!entry || typeof entry !== 'object') fail(`record ${index + 1} must be an object`);
  const label = `record ${index + 1}`;
  if (!Number.isInteger(entry.month) || !expectedMonthDays.has(entry.month)) fail(`${label} has invalid month`);
  if (!Number.isInteger(entry.day) || entry.day < 1 || entry.day > expectedMonthDays.get(entry.month)) fail(`${label} has invalid day`);
  if (typeof entry.label !== 'string' || !entry.label.trim()) fail(`${label} has invalid label`);
  if (!Array.isArray(entry.readings)) fail(`${label} readings must be an array`);
  if (entry.readings.length !== 4) fail(`${label} expected 4 readings, got ${entry.readings.length}`);
  entry.readings.forEach((reading, readingIndex) => {
    if (typeof reading !== 'string' || !reading.trim()) fail(`${label} reading ${readingIndex + 1} is empty`);
  });
  if (entry.sourceReadings !== undefined) {
    if (!Array.isArray(entry.sourceReadings) || entry.sourceReadings.length !== 4) fail(`${label} sourceReadings must contain 4 items`);
  }
  if (entry.normalizedReadings !== undefined) {
    if (!Array.isArray(entry.normalizedReadings) || entry.normalizedReadings.length !== 4) fail(`${label} normalizedReadings must contain 4 items`);
    entry.normalizedReadings.forEach((reading, readingIndex) => {
      if (typeof reading !== 'string' || !reading.trim()) fail(`${label} normalizedReading ${readingIndex + 1} is empty`);
    });
  }
  const dateKey = `${entry.month}-${entry.day}`;
  if (seenDates.has(dateKey)) fail(`duplicate date ${dateKey}`);
  seenDates.add(dateKey);
});

for (const [month, days] of expectedMonthDays) {
  for (let day = 1; day <= days; day += 1) {
    if (!seenDates.has(`${month}-${day}`)) fail(`missing date ${month}-${day}`);
  }
}

const spotChecks = [
  { month: 1, day: 1, readings: ['創 1', '太 1', '以斯拉 1', '徒 1'] },
  { month: 2, day: 16, readings: ['創 49', '路 2', '約伯記 15', '林前 3'] },
  { month: 5, day: 29, readings: ['申命記 2', '詩篇 83-84', '賽 30', '猶大書'] },
  { month: 12, day: 31, readings: ['代下 36', '啟示錄 22', '瑪拉基 4', '約 21'] },
];

spotChecks.forEach((expected) => {
  const entry = plan.find((item) => item.month === expected.month && item.day === expected.day);
  if (!entry) fail(`missing spot check date ${expected.month}-${expected.day}`);
  const actual = entry.readings.join('|');
  const wanted = expected.readings.join('|');
  if (actual !== wanted) {
    fail(`spot check ${entry.label} mismatch: expected ${wanted}, got ${actual}`);
  }
});

console.log('mcheyne-reading-plan validation passed: 365 records, 4 readings per day, spot checks OK');
