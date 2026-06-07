import { execFileSync } from 'node:child_process';

const BIBLE_EPUB_PATH = 'assets/default-books/bible.epub';

const BOOKS = [
  ['GEN', '創世記', 'OT'], ['EXO', '出埃及記', 'OT'], ['LEV', '利未記', 'OT'], ['NUM', '民數記', 'OT'],
  ['DEU', '申命記', 'OT'], ['JOS', '約書亞記', 'OT'], ['JDG', '士師記', 'OT'], ['RUT', '路得記', 'OT'],
  ['1SA', '撒母耳記上', 'OT'], ['2SA', '撒母耳記下', 'OT'], ['1KI', '列王紀上', 'OT'], ['2KI', '列王紀下', 'OT'],
  ['1CH', '歷代志上', 'OT'], ['2CH', '歷代志下', 'OT'], ['EZR', '以斯拉記', 'OT'], ['NEH', '尼希米記', 'OT'],
  ['EST', '以斯帖記', 'OT'], ['JOB', '約伯記', 'OT'], ['PSA', '詩篇', 'OT'], ['PRO', '箴言', 'OT'],
  ['ECC', '傳道書', 'OT'], ['SNG', '雅歌', 'OT'], ['ISA', '以賽亞書', 'OT'], ['JER', '耶利米書', 'OT'],
  ['LAM', '耶利米哀歌', 'OT'], ['EZK', '以西結書', 'OT'], ['DAN', '但以理書', 'OT'], ['HOS', '何西阿書', 'OT'],
  ['JOL', '約珥書', 'OT'], ['AMO', '阿摩司書', 'OT'], ['OBA', '俄巴底亞書', 'OT'], ['JON', '約拿書', 'OT'],
  ['MIC', '彌迦書', 'OT'], ['NAM', '那鴻書', 'OT'], ['HAB', '哈巴谷書', 'OT'], ['ZEP', '西番雅書', 'OT'],
  ['HAG', '哈該書', 'OT'], ['ZEC', '撒迦利亞書', 'OT'], ['MAL', '瑪拉基書', 'OT'],
  ['MAT', '馬太福音', 'NT'], ['MRK', '馬可福音', 'NT'], ['LUK', '路加福音', 'NT'], ['JHN', '約翰福音', 'NT'],
  ['ACT', '使徒行傳', 'NT'], ['ROM', '羅馬書', 'NT'], ['1CO', '哥林多前書', 'NT'], ['2CO', '哥林多後書', 'NT'],
  ['GAL', '加拉太書', 'NT'], ['EPH', '以弗所書', 'NT'], ['PHP', '腓立比書', 'NT'], ['COL', '歌羅西書', 'NT'],
  ['1TH', '帖撒羅尼迦前書', 'NT'], ['2TH', '帖撒羅尼迦後書', 'NT'], ['1TI', '提摩太前書', 'NT'], ['2TI', '提摩太後書', 'NT'],
  ['TIT', '提多書', 'NT'], ['PHM', '腓利門書', 'NT'], ['HEB', '希伯來書', 'NT'], ['JAS', '雅各書', 'NT'],
  ['1PE', '彼得前書', 'NT'], ['2PE', '彼得後書', 'NT'], ['1JN', '約翰一書', 'NT'], ['2JN', '約翰二書', 'NT'],
  ['3JN', '約翰三書', 'NT'], ['JUD', '猶大書', 'NT'], ['REV', '啟示錄', 'NT'],
].map(([code, name, testament]) => ({
  code,
  name,
  testament,
  entryPath: `OEBPS/text/${code}.xhtml`,
}));

const FIRST_CORINTHIANS_CHAPTER_COUNTS = new Map([
  [1, 31], [2, 16], [3, 23], [4, 21], [5, 13], [6, 20], [7, 40], [8, 13],
  [9, 27], [10, 33], [11, 34], [12, 31], [13, 13], [14, 40], [15, 58], [16, 24],
]);

const HIGH_CONFIDENCE_EXPECTATIONS = [
  ['馬可福音 5:41', '翻出來', '繙出來'],
  ['馬可福音 15:22', '翻出來', '繙出來'],
  ['馬可福音 15:34', '翻出來', '繙出來'],
  ['約翰福音 1:41', '翻出來', '繙出來'],
  ['約翰福音 9:7', '翻出來', '繙出來'],
  ['使徒行傳 9:36', '翻希利尼話', '繙希利尼話'],
  ['希伯來書 7:2', '名翻出來', '名繙出來'],
  ['猶大書 1:12', '餵養自己', '餧養自己'],
];

const PASSOVER_REFS = [
  '出埃及記 12:11', '出埃及記 12:21', '出埃及記 12:27', '出埃及記 12:43', '出埃及記 12:48',
  '出埃及記 34:25', '利未記 23:5', '民數記 9:2', '民數記 9:4', '民數記 9:5', '民數記 9:6',
  '民數記 9:10', '民數記 9:11', '民數記 9:12', '民數記 9:13', '民數記 9:14', '民數記 28:16',
  '民數記 33:3', '申命記 16:1', '申命記 16:2', '申命記 16:5', '申命記 16:6', '約書亞記 5:10',
  '約書亞記 5:11', '列王紀下 23:21', '列王紀下 23:22', '列王紀下 23:23', '歷代志下 30:1',
  '歷代志下 30:2', '歷代志下 30:5', '歷代志下 30:15', '歷代志下 30:17', '歷代志下 30:18',
  '歷代志下 35:1', '歷代志下 35:6', '歷代志下 35:7', '歷代志下 35:8', '歷代志下 35:9',
  '歷代志下 35:11', '歷代志下 35:13', '歷代志下 35:16', '歷代志下 35:17', '歷代志下 35:18',
  '歷代志下 35:19', '以斯拉記 6:19', '以斯拉記 6:20', '以西結書 45:21', '以西結書 45:25',
  '馬太福音 26:2', '馬太福音 26:17', '馬太福音 26:18', '馬太福音 26:19', '馬可福音 14:1',
  '馬可福音 14:12', '馬可福音 14:14', '馬可福音 14:16', '路加福音 2:41', '路加福音 22:1',
  '路加福音 22:8', '路加福音 22:11', '路加福音 22:13', '路加福音 22:15', '約翰福音 2:13',
  '約翰福音 2:23', '約翰福音 6:4', '約翰福音 11:55', '約翰福音 12:1', '約翰福音 13:1',
  '約翰福音 18:28', '約翰福音 18:39', '約翰福音 19:14', '使徒行傳 12:4', '希伯來書 11:28',
];

function fail(message) {
  throw new Error(message);
}

function run(command, args = []) {
  return execFileSync(command, args, { encoding: 'utf8', maxBuffer: 80 * 1024 * 1024 });
}

function decodeHtml(value = '') {
  return String(value || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, codePoint) => String.fromCodePoint(Number(codePoint)))
    .replace(/&#x([0-9a-f]+);/gi, (_, codePoint) => String.fromCodePoint(Number.parseInt(codePoint, 16)));
}

function stripTags(value = '') {
  return decodeHtml(String(value || '').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

function extractVerses(xhtml = '') {
  const verses = new Map();
  const versePattern = /<span class="verse"[^>]*id="v(\d+)_(\d+)"[^>]*>[\s\S]*?<span class="verse-text"[^>]*>([\s\S]*?)<\/span>\s*<\/span>/g;
  let match;
  while ((match = versePattern.exec(xhtml))) {
    verses.set(`${Number(match[1])}:${Number(match[2])}`, stripTags(match[3]));
  }
  return verses;
}

function parseReference(reference = '') {
  const book = BOOKS.find(item => reference.startsWith(`${item.name} `));
  if (!book) fail(`Unknown reference book: ${reference}`);
  const [, chapter, verse] = reference.match(/ (\d+):(\d+)$/) || [];
  if (!chapter || !verse) fail(`Invalid reference format: ${reference}`);
  return { book, key: `${Number(chapter)}:${Number(verse)}` };
}

function validateZipStructure() {
  run('unzip', ['-tqq', BIBLE_EPUB_PATH]);
  const listing = run('unzip', ['-lv', BIBLE_EPUB_PATH]);
  const fileLines = listing.split('\n').filter(line => /^\s*\d+\s+/.test(line));
  const firstFileLine = fileLines[0] || '';
  if (!/\bmimetype$/.test(firstFileLine) || !/\bStored\b/.test(firstFileLine)) {
    fail('bible.epub must keep mimetype as the first uncompressed file');
  }
  const opf = run('unzip', ['-p', BIBLE_EPUB_PATH, 'OEBPS/content.opf']);
  for (const book of BOOKS) {
    if (!opf.includes(`href="text/${book.code}.xhtml"`)) fail(`${book.entryPath} missing from OPF manifest`);
    if (!listing.includes(book.entryPath)) fail(`${book.entryPath} missing from EPUB archive`);
  }
  if (BOOKS.filter(book => book.testament === 'OT').length !== 39) fail('Expected 39 Old Testament books');
  if (BOOKS.filter(book => book.testament === 'NT').length !== 27) fail('Expected 27 New Testament books');
}

function buildVerseIndex() {
  const verseIndex = new Map();
  for (const book of BOOKS) {
    const xhtml = run('unzip', ['-p', BIBLE_EPUB_PATH, book.entryPath]);
    verseIndex.set(book.code, extractVerses(xhtml));
  }
  return verseIndex;
}

function expectVerse(verseIndex, reference, required, forbidden) {
  const { book, key } = parseReference(reference);
  const text = verseIndex.get(book.code)?.get(key);
  if (!text) fail(`${reference} is missing`);
  if (required && !text.includes(required)) fail(`${reference} should include ${required}: ${text}`);
  if (forbidden && text.includes(forbidden)) fail(`${reference} should not include ${forbidden}: ${text}`);
}

validateZipStructure();

const verseIndex = buildVerseIndex();
const allText = BOOKS.map(book => run('unzip', ['-p', BIBLE_EPUB_PATH, book.entryPath])).join('\n');

['餧', '餕', '繙', '踰越節'].forEach((token) => {
  if (allText.includes(token)) fail(`bible.epub should not contain ${token}`);
});

if (!allText.includes('妝飾')) fail('bible.epub should preserve confirmed CUV traditional text 妝飾');
if (allText.includes('糢糊')) fail('bible.epub should not contain second-phase corrected text 糢糊');

HIGH_CONFIDENCE_EXPECTATIONS.forEach(([reference, required, forbidden]) => {
  expectVerse(verseIndex, reference, required, forbidden);
});

PASSOVER_REFS.forEach(reference => {
  expectVerse(verseIndex, reference, '逾越節', '踰越節');
});

[
  ['哥林多前書 3:2', '奶餵你們', '餧'],
  ['哥林多前書 3:2', '飯餵你們', '餧'],
  ['哥林多前書 12:10', '翻方言', '繙方言'],
  ['哥林多前書 13:12', '模糊不清', '糢糊'],
].forEach(([reference, required, forbidden]) => {
  expectVerse(verseIndex, reference, required, forbidden);
});

const firstCorinthians = verseIndex.get('1CO');
if (firstCorinthians.size !== 437) fail(`1 Corinthians should have 437 verses, got ${firstCorinthians.size}`);

const firstCorinthiansChapterCounts = new Map();
for (const key of firstCorinthians.keys()) {
  const chapter = Number(key.split(':')[0]);
  firstCorinthiansChapterCounts.set(chapter, (firstCorinthiansChapterCounts.get(chapter) || 0) + 1);
}

for (const [chapter, expected] of FIRST_CORINTHIANS_CHAPTER_COUNTS) {
  const actual = firstCorinthiansChapterCounts.get(chapter) || 0;
  if (actual !== expected) fail(`1 Corinthians ${chapter} should have ${expected} verses, got ${actual}`);
}

console.log('bible.epub text correction validation passed');
