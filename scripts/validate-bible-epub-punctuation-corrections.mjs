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

const PUNCTUATION_CORRECTIONS = [
  ['創世記 32:18', '他自己也在我們後邊？', '他自己也在我們後邊？。'],
  ['民數記 26:32', '屬示米大的，有示米大族；屬希弗的，有希弗族。', '屬示米大的，有示米大族；屬希弗的，有希弗族；。'],
  ['耶利米哀歌 4:15', '人向他們喊著說：不潔淨的，躲開，躲開！', '人向他們喊著說：！不潔淨的，躲開，躲開！'],
  ['阿摩司書 6:10', '又說：不要作聲，因為我們不可提耶和華的名。', '又說：，不要作聲，因為我們不可提耶和華的名。'],
  ['阿摩司書 6:14', '耶和華萬軍之 神說：以色列家阿', '耶和華萬軍之 神說：，以色列家阿'],
  ['約翰福音 4:37', '俗語說：『那人撒種，這人收割』，這話可見是真的。', '俗語說：：『那人撒種，這人收割』，這話可見是真的。'],
  ['哥林多前書 7:12', '我對其餘的人說，不是主說，倘若某弟兄有不信的妻子', '我對其餘的人說，不是主說，：倘若某弟兄有不信的妻子'],
  ['希伯來書 13:3', '好像與他們同受捆綁；也要記念遭苦害的人', '好像與他們同受捆綁；，也要記念遭苦害的人'],
  ['約翰一書 3:10', '從此就顯出誰是神的兒女，誰是魔鬼的兒女。', '從此就顯出誰是神的兒女，。誰是魔鬼的兒女。'],
];

const FORBIDDEN_DUPLICATE_PUNCTUATION = ['？。', '！。', '：！', '：，', '：：', '，：', '；，', '，。', '；。', '、。', '。：'];

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

for (const token of FORBIDDEN_DUPLICATE_PUNCTUATION) {
  if (allText.includes(token)) fail(`bible.epub should not contain duplicate punctuation ${token}`);
}

for (const token of ['餧', '餕', '繙', '踰越節', '糢糊']) {
  if (allText.includes(token)) fail(`bible.epub should not contain previous corrected text ${token}`);
}

PUNCTUATION_CORRECTIONS.forEach(([reference, required, forbidden]) => {
  expectVerse(verseIndex, reference, required, forbidden);
});

console.log('bible.epub punctuation correction validation passed');
