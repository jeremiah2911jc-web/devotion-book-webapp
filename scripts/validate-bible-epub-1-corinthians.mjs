import { execFileSync } from 'node:child_process';

const BIBLE_EPUB_PATH = 'assets/default-books/bible.epub';
const FIRST_CORINTHIANS_ENTRY = 'OEBPS/text/1CO.xhtml';

const EXPECTED_CHAPTER_COUNTS = new Map([
  [1, 31],
  [2, 16],
  [3, 23],
  [4, 21],
  [5, 13],
  [6, 20],
  [7, 40],
  [8, 13],
  [9, 27],
  [10, 33],
  [11, 34],
  [12, 31],
  [13, 13],
  [14, 40],
  [15, 58],
  [16, 24],
]);

function fail(message) {
  throw new Error(message);
}

function run(command, args = []) {
  return execFileSync(command, args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
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

function extractFirstCorinthiansVerses(xhtml = '') {
  const verses = new Map();
  const versePattern = /<span class="verse"[^>]*id="v(\d+)_(\d+)"[^>]*>[\s\S]*?<span class="verse-text"[^>]*>([\s\S]*?)<\/span>\s*<\/span>/g;
  let match;
  while ((match = versePattern.exec(xhtml))) {
    verses.set(`${Number(match[1])}:${Number(match[2])}`, {
      chapter: Number(match[1]),
      verse: Number(match[2]),
      text: stripTags(match[3]),
    });
  }
  return verses;
}

function validateEpubStructure() {
  const zipListing = run('unzip', ['-lv', BIBLE_EPUB_PATH]);
  const fileLines = zipListing.split('\n').filter(line => /^\s*\d+\s+/.test(line));
  const firstFileLine = fileLines[0] || '';
  if (!/\bmimetype$/.test(firstFileLine) || !/\bStored\b/.test(firstFileLine)) {
    fail('bible.epub must keep mimetype as the first uncompressed file');
  }
  if (!zipListing.includes(FIRST_CORINTHIANS_ENTRY)) {
    fail(`${FIRST_CORINTHIANS_ENTRY} is missing from bible.epub`);
  }
}

function expectVerseText(verses, key, predicate, message) {
  const verse = verses.get(key);
  if (!verse?.text) fail(`${key} is missing`);
  if (!predicate(verse.text)) fail(`${message}: ${verse.text}`);
}

validateEpubStructure();

const firstCorinthiansXhtml = run('unzip', ['-p', BIBLE_EPUB_PATH, FIRST_CORINTHIANS_ENTRY]);
const verses = extractFirstCorinthiansVerses(firstCorinthiansXhtml);

if (verses.size !== 437) fail(`1 Corinthians should have 437 verses, got ${verses.size}`);

const chapterCounts = new Map();
for (const verse of verses.values()) {
  chapterCounts.set(verse.chapter, (chapterCounts.get(verse.chapter) || 0) + 1);
}

for (const [chapter, expectedCount] of EXPECTED_CHAPTER_COUNTS) {
  const actualCount = chapterCounts.get(chapter) || 0;
  if (actualCount !== expectedCount) {
    fail(`1 Corinthians ${chapter} should have ${expectedCount} verses, got ${actualCount}`);
  }
}

expectVerseText(
  verses,
  '3:2',
  text => text.includes('奶餵你們') && text.includes('飯餵你們') && !text.includes('餧'),
  '1 Corinthians 3:2 should use 餵, not 餧',
);

expectVerseText(
  verses,
  '12:10',
  text => text.includes('翻方言') && !text.includes('繙方言'),
  '1 Corinthians 12:10 should use 翻方言',
);

if (firstCorinthiansXhtml.includes('繙')) fail('1 Corinthians should not contain 繙 after the CUVMP text correction');
if (firstCorinthiansXhtml.includes('餧')) fail('1 Corinthians should not contain 餧');

[
  ['11:17-26', 11, 17, 26],
  ['12:12-20', 12, 12, 20],
  ['12:30-31', 12, 30, 31],
  ['13:1-13', 13, 1, 13],
  ['15:1-8', 15, 1, 8],
].forEach(([label, chapter, startVerse, endVerse]) => {
  const range = [];
  for (let verse = startVerse; verse <= endVerse; verse += 1) {
    const item = verses.get(`${chapter}:${verse}`);
    if (!item?.text) fail(`1 Corinthians ${label} is missing verse ${verse}`);
    range.push(item);
  }
  if (range.length !== endVerse - startVerse + 1) fail(`1 Corinthians ${label} did not extract fully`);
});

console.log('bible.epub 1 Corinthians validation passed');
