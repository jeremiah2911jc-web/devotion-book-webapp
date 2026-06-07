import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const AUDIT_DATE = process.env.AUDIT_DATE || '20260607';
const REPO_PATH = process.cwd();
const BIBLE_EPUB_PATH = 'assets/default-books/bible.epub';
const EBIBLE_USFM_URL = 'https://ebible.org/Scriptures/cmn-cu89t_usfm.zip';
const ARTIFACTS_DIR = process.env.AUDIT_ARTIFACTS_DIR || path.join(REPO_PATH, 'artifacts');
const CACHE_DIR = path.join(ARTIFACTS_DIR, 'bible-text-audit-cache');
const EBIBLE_ZIP_PATH = path.join(CACHE_DIR, 'cmn-cu89t_usfm.zip');
const JSON_REPORT_PATH = process.env.AUDIT_JSON_PATH || path.join(ARTIFACTS_DIR, `bible-text-full-audit-${AUDIT_DATE}.json`);
const MARKDOWN_REPORT_PATH = process.env.AUDIT_MARKDOWN_PATH || path.join(REPO_PATH, `BIBLE_TEXT_FULL_AUDIT_${AUDIT_DATE}.md`);

const BOOKS = [
  ['GEN', '創世記', 'OT'],
  ['EXO', '出埃及記', 'OT'],
  ['LEV', '利未記', 'OT'],
  ['NUM', '民數記', 'OT'],
  ['DEU', '申命記', 'OT'],
  ['JOS', '約書亞記', 'OT'],
  ['JDG', '士師記', 'OT'],
  ['RUT', '路得記', 'OT'],
  ['1SA', '撒母耳記上', 'OT'],
  ['2SA', '撒母耳記下', 'OT'],
  ['1KI', '列王紀上', 'OT'],
  ['2KI', '列王紀下', 'OT'],
  ['1CH', '歷代志上', 'OT'],
  ['2CH', '歷代志下', 'OT'],
  ['EZR', '以斯拉記', 'OT'],
  ['NEH', '尼希米記', 'OT'],
  ['EST', '以斯帖記', 'OT'],
  ['JOB', '約伯記', 'OT'],
  ['PSA', '詩篇', 'OT'],
  ['PRO', '箴言', 'OT'],
  ['ECC', '傳道書', 'OT'],
  ['SNG', '雅歌', 'OT'],
  ['ISA', '以賽亞書', 'OT'],
  ['JER', '耶利米書', 'OT'],
  ['LAM', '耶利米哀歌', 'OT'],
  ['EZK', '以西結書', 'OT'],
  ['DAN', '但以理書', 'OT'],
  ['HOS', '何西阿書', 'OT'],
  ['JOL', '約珥書', 'OT'],
  ['AMO', '阿摩司書', 'OT'],
  ['OBA', '俄巴底亞書', 'OT'],
  ['JON', '約拿書', 'OT'],
  ['MIC', '彌迦書', 'OT'],
  ['NAM', '那鴻書', 'OT'],
  ['HAB', '哈巴谷書', 'OT'],
  ['ZEP', '西番雅書', 'OT'],
  ['HAG', '哈該書', 'OT'],
  ['ZEC', '撒迦利亞書', 'OT'],
  ['MAL', '瑪拉基書', 'OT'],
  ['MAT', '馬太福音', 'NT'],
  ['MRK', '馬可福音', 'NT'],
  ['LUK', '路加福音', 'NT'],
  ['JHN', '約翰福音', 'NT'],
  ['ACT', '使徒行傳', 'NT'],
  ['ROM', '羅馬書', 'NT'],
  ['1CO', '哥林多前書', 'NT'],
  ['2CO', '哥林多後書', 'NT'],
  ['GAL', '加拉太書', 'NT'],
  ['EPH', '以弗所書', 'NT'],
  ['PHP', '腓立比書', 'NT'],
  ['COL', '歌羅西書', 'NT'],
  ['1TH', '帖撒羅尼迦前書', 'NT'],
  ['2TH', '帖撒羅尼迦後書', 'NT'],
  ['1TI', '提摩太前書', 'NT'],
  ['2TI', '提摩太後書', 'NT'],
  ['TIT', '提多書', 'NT'],
  ['PHM', '腓利門書', 'NT'],
  ['HEB', '希伯來書', 'NT'],
  ['JAS', '雅各書', 'NT'],
  ['1PE', '彼得前書', 'NT'],
  ['2PE', '彼得後書', 'NT'],
  ['1JN', '約翰一書', 'NT'],
  ['2JN', '約翰二書', 'NT'],
  ['3JN', '約翰三書', 'NT'],
  ['JUD', '猶大書', 'NT'],
  ['REV', '啟示錄', 'NT'],
].map(([code, name, testament], index) => ({
  code,
  name,
  testament,
  order: index + 1,
  entryPath: `OEBPS/text/${code}.xhtml`,
}));

const KNOWN_TOKEN_RULES = [
  { token: '餧', expected: '餵', category: '確認錯字', confidence: '高', note: '多數現代和合本來源作「餵」；此字若出現在「餧養 / 奶餧」語境，極可能為錯字。' },
  { token: '餕', expected: '餵', category: '確認錯字', confidence: '高', note: '前輪曾誤寫的相近字；若出現需人工確認是否為「餵」。' },
  { token: '繙', expected: '翻', category: '確認錯字', confidence: '高', note: '本系統目前採較現代化和合本文字；同類「繙」建議優先確認為「翻」。' },
  { token: '踰越節', expected: '逾越節', category: '疑似錯字', confidence: '中', note: '「踰」可視為異體/舊字，但節期名稱多數和合本來源作「逾越節」。' },
  { token: '妝飾', expected: '裝飾', category: '不修正', confidence: '中', recommendation: '來源支持傳統用字，本輪不修正', note: 'eBible、Wikisource、CNBible CUV 均支持「妝飾」；不因 CUVMP 現代字形偏好批次改為「裝飾」。' },
  { token: '糢糊', expected: '模糊', category: '繁簡 / 異體差異', confidence: '低', recommendation: '第二階段已確認修正為模糊，不再列待人工確認', note: 'eBible、Wikisource、CNBible 頁面與 CUVMP 作「模糊」；CNBible CUV 保留「糢糊」。第二階段依多數可信來源與本站文字政策修正。' },
  { token: '衆', expected: '眾', category: '繁簡 / 異體差異', confidence: '低', note: '異體字；除非全站字形政策要求，否則不急修。' },
  { token: '亂碼', expected: '', category: '待人工確認', confidence: '高', note: '若出現即需人工確認。' },
];

const POLICY_TOKEN_SCAN_RULES = [
  { token: '糢', expected: '模', decision: '已確認應修', action: '已修正', note: '僅出現在哥林多前書 13:12「糢糊不清」；第二階段修為「模糊不清」。' },
  { token: '糢糊', expected: '模糊', decision: '已確認應修', action: '已修正', note: '同上；正文與小字註記都同步修正。' },
  { token: '裏', expected: '裡', decision: '已確認不修', action: '不修正', note: '目前內建 EPUB 未使用「裏」，已採「裡」。' },
  { token: '衆', expected: '眾', decision: '已確認不修', action: '不修正', note: '目前內建 EPUB 未使用「衆」，已採「眾」。' },
  { token: '于', expected: '於', decision: '已確認不修', action: '不修正', note: '僅見於歷代志上 3:20 人名「于沙希悉」，不是介詞「於」的字形問題。' },
  { token: '祇', expected: '只', decision: '已確認不修', action: '不修正', note: '目前內建 EPUB 未使用「祇」。' },
  { token: '纔', expected: '才', decision: '已確認不修', action: '不修正', note: '目前內建 EPUB 未使用「纔」。' },
  { token: '爲', expected: '為', decision: '已確認不修', action: '不修正', note: '目前內建 EPUB 未使用「爲」，已採「為」。' },
  { token: '着', expected: '著', decision: '已確認不修', action: '不修正', note: '目前內建 EPUB 未使用「着」，已採「著」。' },
];

const FIRST_PHASE_HIGH_CONFIDENCE_DECISIONS = [
  ['馬可福音', '馬可福音 5:41', '繙出來', '翻出來', 'eBible / Wikisource / CNBible CUV 均支持「翻」。', '已修正', '確認錯字；修正不改變經文意思。'],
  ['馬可福音', '馬可福音 15:22', '繙出來', '翻出來', 'eBible / Wikisource / CNBible CUV 均支持「翻」。', '已修正', '確認錯字；修正不改變經文意思。'],
  ['馬可福音', '馬可福音 15:34', '繙出來', '翻出來', 'eBible / Wikisource / CNBible CUV 均支持「翻」。', '已修正', '確認錯字；修正不改變經文意思。'],
  ['約翰福音', '約翰福音 1:41', '繙出來', '翻出來', 'eBible / Wikisource / CNBible CUV 均支持「翻」。', '已修正', '確認錯字；修正不改變經文意思。'],
  ['約翰福音', '約翰福音 9:7', '繙出來', '翻出來', 'eBible / Wikisource / CNBible CUV 均支持「翻」。', '已修正', '確認錯字；修正不改變經文意思。'],
  ['使徒行傳', '使徒行傳 9:36', '繙希利尼話', '翻希利尼話', 'eBible / Wikisource / CNBible CUV 均支持「翻」。', '已修正', '確認錯字；修正不改變經文意思。'],
  ['希伯來書', '希伯來書 7:2', '名繙出來', '名翻出來', 'eBible / Wikisource / CNBible CUV 均支持「翻」。', '已修正', '確認錯字；修正不改變經文意思。'],
  ['猶大書', '猶大書 1:12', '餧養自己', '餵養自己', 'eBible / Wikisource / CNBible CUV 均支持「餵養」。', '已修正', '確認錯字；修正不改變經文意思。'],
];

const PASSOVER_REFS = [
  '出埃及記 12:11',
  '出埃及記 12:21',
  '出埃及記 12:27',
  '出埃及記 12:43',
  '出埃及記 12:48',
  '出埃及記 34:25',
  '利未記 23:5',
  '民數記 9:2',
  '民數記 9:4',
  '民數記 9:5',
  '民數記 9:6',
  '民數記 9:10',
  '民數記 9:11',
  '民數記 9:12',
  '民數記 9:13',
  '民數記 9:14',
  '民數記 28:16',
  '民數記 33:3',
  '申命記 16:1',
  '申命記 16:2',
  '申命記 16:5',
  '申命記 16:6',
  '約書亞記 5:10',
  '約書亞記 5:11',
  '列王紀下 23:21',
  '列王紀下 23:22',
  '列王紀下 23:23',
  '歷代志下 30:1',
  '歷代志下 30:2',
  '歷代志下 30:5',
  '歷代志下 30:15',
  '歷代志下 30:17',
  '歷代志下 30:18',
  '歷代志下 35:1',
  '歷代志下 35:6',
  '歷代志下 35:7',
  '歷代志下 35:8',
  '歷代志下 35:9',
  '歷代志下 35:11',
  '歷代志下 35:13',
  '歷代志下 35:16',
  '歷代志下 35:17',
  '歷代志下 35:18',
  '歷代志下 35:19',
  '以斯拉記 6:19',
  '以斯拉記 6:20',
  '以西結書 45:21',
  '以西結書 45:25',
  '馬太福音 26:2',
  '馬太福音 26:17',
  '馬太福音 26:18',
  '馬太福音 26:19',
  '馬可福音 14:1',
  '馬可福音 14:12',
  '馬可福音 14:14',
  '馬可福音 14:16',
  '路加福音 2:41',
  '路加福音 22:1',
  '路加福音 22:8',
  '路加福音 22:11',
  '路加福音 22:13',
  '路加福音 22:15',
  '約翰福音 2:13',
  '約翰福音 2:23',
  '約翰福音 6:4',
  '約翰福音 11:55',
  '約翰福音 12:1',
  '約翰福音 13:1',
  '約翰福音 18:28',
  '約翰福音 18:39',
  '約翰福音 19:14',
  '使徒行傳 12:4',
  '希伯來書 11:28',
];

const ADORNMENT_REFS = [
  '出埃及記 33:4',
  '出埃及記 33:5',
  '出埃及記 33:6',
  '撒母耳記下 1:24',
  '歷代志上 16:29',
  '歷代志下 4:22',
  '約伯記 26:13',
  '約伯記 40:10',
  '詩篇 29:2',
  '詩篇 96:9',
  '詩篇 110:3',
  '詩篇 149:4',
  '箴言 25:12',
  '以賽亞書 49:18',
  '以賽亞書 61:10',
  '耶利米書 2:32',
  '耶利米書 10:4',
  '以西結書 7:20',
  '以西結書 16:11',
  '以西結書 16:13',
  '以西結書 23:40',
  '何西阿書 2:13',
  '馬太福音 6:30',
  '路加福音 12:28',
  '路加福音 21:5',
  '提摩太前書 2:9',
  '彼得前書 3:3',
  '彼得前書 3:4',
  '彼得前書 3:5',
  '啟示錄 17:4',
  '啟示錄 18:16',
  '啟示錄 21:2',
];

const FIRST_PHASE_LOW_CONFIDENCE_DECISIONS = [
  ['哥林多前書', '哥林多前書 13:12', '糢糊不清', '模糊不清', 'eBible / Wikisource / CNBible CUVMP 作「模糊」，CNBible CUV 保留「糢糊」。', '第一階段待確認；第二階段已修正', '第一階段因來源不一致列為字形政策項目；第二階段依多數可信來源與本站字形政策修正。'],
];

const SECOND_PHASE_POLICY_DECISIONS = [
  ['哥林多前書', '哥林多前書 13:12', '糢糊不清', '模糊不清', 'eBible cmn-cu89t USFM：模糊；Wikisource 和合本：模糊；CNBible 頁面 / CUVMP：模糊；CNBible CUV：糢糊。', '已修正', '多數可信來源使用「模糊」，修正不改變經文意思，且符合本站已採「裡 / 著 / 為 / 眾」等較通行繁體字形的文字政策。'],
];

const REFERENCE_SOURCES = [
  {
    name: 'eBible cmn-cu89t USFM',
    url: EBIBLE_USFM_URL,
    usage: '本輪自動逐節結構與文字比對主來源。',
  },
  {
    name: 'Wikisource 聖經（和合本）',
    url: 'https://zh.wikisource.org/wiki/聖經_(和合本)',
    usage: '疑似錯字人工佐證來源之一。',
  },
  {
    name: 'CNBible CUV / CUVMP',
    url: 'https://cnbible.com/',
    usage: '疑似錯字人工佐證來源之一，避免把單一來源差異直接定為錯字。',
  },
];

function run(command, args = [], options = {}) {
  return execFileSync(command, args, {
    encoding: options.encoding || 'utf8',
    maxBuffer: options.maxBuffer || 80 * 1024 * 1024,
  });
}

function ensureArtifacts() {
  mkdirSync(CACHE_DIR, { recursive: true });
}

function ensureReferenceZip() {
  ensureArtifacts();
  if (existsSync(EBIBLE_ZIP_PATH)) return;
  run('curl', ['-fsSL', EBIBLE_USFM_URL, '-o', EBIBLE_ZIP_PATH], { maxBuffer: 10 * 1024 * 1024 });
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

function parseOpfMetadata(opf = '') {
  const readTag = tag => {
    const match = opf.match(new RegExp(`<dc:${tag}[^>]*>([\\s\\S]*?)<\\/dc:${tag}>`));
    return match ? stripTags(match[1]) : '';
  };
  const modified = opf.match(/<meta[^>]*property="dcterms:modified"[^>]*>([\s\S]*?)<\/meta>/)?.[1] || '';
  return {
    identifier: opf.match(/<dc:identifier[^>]*>([\s\S]*?)<\/dc:identifier>/)?.[1] || '',
    title: readTag('title'),
    language: readTag('language'),
    creator: readTag('creator'),
    modified: stripTags(modified),
  };
}

function parseOpfEntries(opf = '') {
  const manifestEntries = [...opf.matchAll(/<item\s+([^>]+?)\/>/g)].map(match => {
    const attrs = match[1];
    return {
      id: attrs.match(/\bid="([^"]+)"/)?.[1] || '',
      href: attrs.match(/\bhref="([^"]+)"/)?.[1] || '',
      mediaType: attrs.match(/\bmedia-type="([^"]+)"/)?.[1] || '',
    };
  });
  const spineIds = [...opf.matchAll(/<itemref\s+[^>]*idref="([^"]+)"/g)].map(match => match[1]);
  const byId = new Map(manifestEntries.map(entry => [entry.id, entry]));
  return spineIds
    .map(id => byId.get(id))
    .filter(entry => entry?.href?.startsWith('text/'))
    .map(entry => ({
      id: entry.id,
      href: entry.href,
      entryPath: `OEBPS/${entry.href}`,
    }));
}

function extractBookTitle(xhtml = '') {
  return stripTags(xhtml.match(/<h1[^>]*class="book"[^>]*>([\s\S]*?)<\/h1>/)?.[1] || '');
}

function extractEpubVerses(xhtml = '') {
  const verses = [];
  const seenKeys = new Set();
  const duplicateKeys = [];
  const versePattern = /<span class="verse"[^>]*id="v(\d+)_(\d+)"[^>]*>[\s\S]*?<span class="verse-text"[^>]*>([\s\S]*?)<\/span>\s*<\/span>/g;
  let match;
  while ((match = versePattern.exec(xhtml))) {
    const chapter = Number(match[1]);
    const verse = Number(match[2]);
    const key = `${chapter}:${verse}`;
    if (seenKeys.has(key)) duplicateKeys.push(key);
    seenKeys.add(key);
    verses.push({
      chapter,
      verse,
      key,
      text: stripTags(match[3]),
    });
  }
  return { verses, duplicateKeys };
}

function stripUsfm(value = '') {
  return String(value || '')
    .replace(/\\f\s+[\s\S]*?\\f\*/g, '')
    .replace(/\\x\s+[\s\S]*?\\x\*/g, '')
    .replace(/\\[a-z0-9]+\*?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function expandVerseToken(token = '') {
  const match = String(token || '').match(/^(\d+)(?:-(\d+))?$/);
  if (!match) return [];
  const start = Number(match[1]);
  const end = Number(match[2] || match[1]);
  const verses = [];
  for (let verse = start; verse <= end; verse += 1) verses.push(verse);
  return verses;
}

function parseUsfmBook(usfm = '') {
  const verses = [];
  const verseRanges = [];
  let chapter = 0;
  let activeVerses = [];
  let buffer = [];

  function flush() {
    if (!chapter || !activeVerses.length) return;
    const text = stripUsfm(buffer.join(' '));
    for (const verse of activeVerses) {
      verses.push({
        chapter,
        verse,
        key: `${chapter}:${verse}`,
        text,
        sourceVerseToken: activeVerses.length > 1 ? `${activeVerses[0]}-${activeVerses[activeVerses.length - 1]}` : String(verse),
        isRangeSource: activeVerses.length > 1,
      });
    }
  }

  for (const rawLine of String(usfm || '').replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trim();
    const chapterMatch = line.match(/^\\c\s+(\d+)/);
    if (chapterMatch) {
      flush();
      chapter = Number(chapterMatch[1]);
      activeVerses = [];
      buffer = [];
      continue;
    }
    const verseMatch = line.match(/^\\v\s+([0-9-]+)\s*([\s\S]*)$/);
    if (verseMatch) {
      flush();
      activeVerses = expandVerseToken(verseMatch[1]);
      if (activeVerses.length > 1) verseRanges.push({ chapter, token: verseMatch[1] });
      buffer = [verseMatch[2] || ''];
      continue;
    }
    if (activeVerses.length && line) buffer.push(line);
  }
  flush();
  return { verses, verseRanges };
}

function listUsfmFiles() {
  ensureReferenceZip();
  return run('unzip', ['-Z1', EBIBLE_ZIP_PATH])
    .split('\n')
    .map(value => value.trim())
    .filter(value => value.endsWith('.usfm'));
}

function getUsfmFileForBook(files, code) {
  return files.find(file => new RegExp(`-${code}cmn-cu89t\\.usfm$`).test(file)) || '';
}

function normalizeWhitespace(value = '') {
  return String(value || '').replace(/\s+/g, '').replace(/\u3000/g, '');
}

function removePunctuation(value = '') {
  return normalizeWhitespace(value).replace(/[，。；：、！？「」『』（）()《》〈〉—－\-…·．,.!?;:"'“”‘’\[\]【】]/g, '');
}

function normalizeVariants(value = '') {
  return removePunctuation(value)
    .replace(/裏/g, '裡')
    .replace(/着/g, '著')
    .replace(/爲/g, '為')
    .replace(/衆/g, '眾')
    .replace(/喫/g, '吃')
    .replace(/糢/g, '模')
    .replace(/麼/g, '嗎')
    .replace(/鉤/g, '鈎')
    .replace(/沈/g, '沉');
}

function normalizeVersionTerms(value = '') {
  return normalizeVariants(value)
    .replace(/上帝/g, '神')
    .replace(/希臘/g, '希利尼')
    .replace(/哪裏/g, '那裡')
    .replace(/哪裡/g, '那裡')
    .replace(/司提法那/g, '司提反');
}

function classifyVerseDifference(localText = '', refText = '', { isRangeSource = false } = {}) {
  if (!refText) return '章節結構差異';
  if (localText === refText) return '相同';
  if (isRangeSource) return '章節結構差異';
  if (normalizeWhitespace(localText) === normalizeWhitespace(refText)) return '標點差異';
  if (removePunctuation(localText) === removePunctuation(refText)) return '標點差異';
  if (normalizeVariants(localText) === normalizeVariants(refText)) return '繁簡 / 異體差異';
  if (normalizeVersionTerms(localText) === normalizeVersionTerms(refText)) return '譯本差異';
  if (/[（(].{1,24}(原文|有古卷|或作|小字)[^）)]*[）)]/.test(localText) || /\\f|或譯|有古卷|原文/.test(refText)) {
    return '註記格式差異';
  }
  return '待人工確認';
}

function summarizeChapters(verses = []) {
  const chapters = new Map();
  for (const verse of verses) {
    if (!chapters.has(verse.chapter)) chapters.set(verse.chapter, []);
    chapters.get(verse.chapter).push(verse.verse);
  }
  return [...chapters.entries()].sort((a, b) => a[0] - b[0]).map(([chapter, chapterVerses]) => ({
    chapter,
    verseCount: chapterVerses.length,
    firstVerse: Math.min(...chapterVerses),
    lastVerse: Math.max(...chapterVerses),
    missingVerses: getMissingNumbers(chapterVerses),
    duplicateVerses: getDuplicateNumbers(chapterVerses),
  }));
}

function getMissingNumbers(values = []) {
  if (!values.length) return [];
  const set = new Set(values);
  const missing = [];
  for (let value = Math.min(...values); value <= Math.max(...values); value += 1) {
    if (!set.has(value)) missing.push(value);
  }
  return missing;
}

function getDuplicateNumbers(values = []) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].sort((a, b) => a - b);
}

function excerpt(value = '', length = 90) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  return normalized.length > length ? `${normalized.slice(0, length)}...` : normalized;
}

function findKnownTokenIssues(book, localVerses, referenceByKey) {
  const issues = [];
  for (const verse of localVerses) {
    for (const rule of KNOWN_TOKEN_RULES) {
      if (!verse.text.includes(rule.token)) continue;
      const reference = referenceByKey.get(verse.key)?.text || '';
      const referenceSupportsExpected = rule.expected ? reference.includes(rule.expected) : false;
      issues.push({
        book: book.name,
        code: book.code,
        testament: book.testament,
        reference: `${book.name} ${verse.chapter}:${verse.verse}`,
        key: `${book.code}.${verse.key}`,
        localText: verse.text,
        referenceText: reference,
        difference: rule.expected
          ? `${rule.token} / ${rule.expected}${referenceSupportsExpected ? '（對照來源支持建議字）' : ''}`
          : rule.token,
        category: rule.category,
        recommendation: rule.recommendation || (rule.confidence === '高' ? '列入第一階段人工確認後修正' : '列入人工確認，不建議直接批次硬改'),
        confidence: rule.confidence,
        note: rule.note,
      });
    }
  }
  return issues;
}

function scanPolicyTokensFromBookTexts(bookTextIndex = []) {
  return POLICY_TOKEN_SCAN_RULES.map(rule => {
    const hits = [];
    for (const book of bookTextIndex) {
      for (const verse of book.verses) {
        if (!verse.text.includes(rule.token)) continue;
        const count = verse.text.split(rule.token).length - 1;
        hits.push({
          book: book.name,
          reference: `${book.name} ${verse.chapter}:${verse.verse}`,
          text: verse.text,
          count,
        });
      }
    }
    return {
      ...rule,
      count: hits.reduce((sum, hit) => sum + hit.count, 0),
      references: hits.map(hit => hit.reference),
      examples: hits.slice(0, 6).map(hit => `${hit.reference} ${excerpt(hit.text, 70)}`),
    };
  });
}

function buildBookAudit(book, opfEntries, usfmFiles) {
  const entryPath = book.entryPath;
  const xhtml = run('unzip', ['-p', BIBLE_EPUB_PATH, entryPath]);
  const { verses: localVerses, duplicateKeys } = extractEpubVerses(xhtml);
  const usfmFile = getUsfmFileForBook(usfmFiles, book.code);
  const usfmText = usfmFile ? run('unzip', ['-p', EBIBLE_ZIP_PATH, usfmFile]) : '';
  const { verses: referenceVerses, verseRanges } = parseUsfmBook(usfmText);
  const referenceByKey = new Map(referenceVerses.map(verse => [verse.key, verse]));
  const localByKey = new Map(localVerses.map(verse => [verse.key, verse]));
  const classifications = {};
  const missingInLocal = [];
  const missingInReference = [];
  const emptyVerses = localVerses.filter(verse => !verse.text.trim()).map(verse => verse.key);
  const differenceExamples = [];

  for (const referenceVerse of referenceVerses) {
    if (!localByKey.has(referenceVerse.key)) missingInLocal.push(referenceVerse.key);
  }
  for (const localVerse of localVerses) {
    if (!referenceByKey.has(localVerse.key)) missingInReference.push(localVerse.key);
    const refVerse = referenceByKey.get(localVerse.key);
    const classification = classifyVerseDifference(localVerse.text, refVerse?.text || '', {
      isRangeSource: !!refVerse?.isRangeSource,
    });
    classifications[classification] = (classifications[classification] || 0) + 1;
    if (classification !== '相同' && differenceExamples.length < 8) {
      differenceExamples.push({
        reference: `${book.name} ${localVerse.chapter}:${localVerse.verse}`,
        localText: localVerse.text,
        referenceText: refVerse?.text || '',
        classification,
      });
    }
  }

  const localChapters = summarizeChapters(localVerses);
  const referenceChapters = summarizeChapters(referenceVerses);
  const referenceChapterCountByChapter = new Map(referenceChapters.map(chapter => [chapter.chapter, chapter.verseCount]));
  const chapterMismatches = localChapters
    .filter(chapter => referenceChapterCountByChapter.get(chapter.chapter) !== chapter.verseCount)
    .map(chapter => ({
      chapter: chapter.chapter,
      localVerseCount: chapter.verseCount,
      referenceVerseCount: referenceChapterCountByChapter.get(chapter.chapter) || 0,
    }));

  const knownTokenIssues = findKnownTokenIssues(book, localVerses, referenceByKey);

  return {
    code: book.code,
    name: book.name,
    testament: book.testament,
    order: book.order,
    entryPath,
    opfListed: opfEntries.some(entry => entry.entryPath === entryPath),
    usfmFile,
    epubBookTitle: extractBookTitle(xhtml),
    localChapterCount: localChapters.length,
    referenceChapterCount: referenceChapters.length,
    localVerseCount: localVerses.length,
    referenceVerseCount: referenceVerses.length,
    localChapters,
    referenceChapters,
    duplicateKeys,
    emptyVerses,
    missingInLocal,
    missingInReference,
    chapterMismatches,
    usfmVerseRanges: verseRanges,
    classifications,
    differenceExamples,
    knownTokenIssues,
    localVerses,
  };
}

function aggregate(bookAudits, opfMetadata, opfEntries) {
  const allIssues = bookAudits.flatMap(book => book.knownTokenIssues);
  const confidenceCounts = allIssues.reduce((acc, issue) => {
    acc[issue.confidence] = (acc[issue.confidence] || 0) + 1;
    return acc;
  }, {});
  const classificationCounts = {};
  for (const book of bookAudits) {
    for (const [classification, count] of Object.entries(book.classifications)) {
      classificationCounts[classification] = (classificationCounts[classification] || 0) + count;
    }
  }
  const structureIssues = bookAudits.flatMap(book => [
    ...book.duplicateKeys.map(key => ({ book: book.name, issue: `重複節 ${key}` })),
    ...book.emptyVerses.map(key => ({ book: book.name, issue: `空白節 ${key}` })),
    ...book.missingInLocal.map(key => ({ book: book.name, issue: `內建缺少 ${key}` })),
    ...book.missingInReference.map(key => ({ book: book.name, issue: `對照來源缺少 ${key}` })),
    ...book.chapterMismatches.map(item => ({ book: book.name, issue: `第 ${item.chapter} 章節數：內建 ${item.localVerseCount} / 對照 ${item.referenceVerseCount}` })),
  ]);
  const policyTokenScan = scanPolicyTokensFromBookTexts(bookAudits.map(book => ({
    name: book.name,
    verses: book.localVerses,
  })));
  return {
    generatedAt: new Date().toISOString(),
    repoPath: REPO_PATH,
    bibleEpubPath: BIBLE_EPUB_PATH,
    metadata: opfMetadata,
    referenceSources: REFERENCE_SOURCES,
    gitStatusShort: run('git', ['status', '--short']) || '(clean)',
    bookCount: bookAudits.length,
    oldTestamentBookCount: bookAudits.filter(book => book.testament === 'OT').length,
    newTestamentBookCount: bookAudits.filter(book => book.testament === 'NT').length,
    opfEntryCount: opfEntries.length,
    totalLocalVerses: bookAudits.reduce((sum, book) => sum + book.localVerseCount, 0),
    totalReferenceVerses: bookAudits.reduce((sum, book) => sum + book.referenceVerseCount, 0),
    structureIssueCount: structureIssues.length,
    structureIssues,
    classificationCounts,
    suspectedIssueCount: allIssues.length,
    confidenceCounts: {
      '高': confidenceCounts['高'] || 0,
      '中': confidenceCounts['中'] || 0,
      '低': confidenceCounts['低'] || 0,
    },
    knownTokenOccurrences: KNOWN_TOKEN_RULES.map(rule => ({
      token: rule.token,
      count: allIssues.filter(issue => issue.difference.startsWith(`${rule.token} /`) || issue.difference === rule.token).length,
    })),
    policyTokenScan,
    suspectedIssues: allIssues.map((issue, index) => ({ ...issue, index: index + 1 })),
  };
}

function markdownTable(rows, columns) {
  const header = `| ${columns.map(column => column.label).join(' | ')} |`;
  const separator = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows.map(row => `| ${columns.map(column => String(column.value(row) ?? '').replace(/\|/g, '\\|')).join(' | ')} |`);
  return [header, separator, ...body].join('\n');
}

function bookNameFromReference(reference = '') {
  return BOOKS.find(book => reference.startsWith(`${book.name} `))?.name || '';
}

function buildFirstPhaseDecisionRows() {
  const highRows = FIRST_PHASE_HIGH_CONFIDENCE_DECISIONS.map(([book, reference, original, comparison, sources, result, reason]) => ({
    confidence: '高',
    book,
    reference,
    original,
    comparison,
    sources,
    result,
    reason,
  }));
  const passoverRows = PASSOVER_REFS.map(reference => ({
    confidence: '中',
    book: bookNameFromReference(reference),
    reference,
    original: '踰越節',
    comparison: '逾越節',
    sources: 'eBible / Wikisource / CNBible CUV / CNBible CUVMP 均作「逾越節」。',
    result: '已修正',
    reason: '多個可信和合本來源一致支持修正；屬節期名稱用字校正。',
  }));
  const adornmentRows = ADORNMENT_REFS.map(reference => ({
    confidence: '中',
    book: bookNameFromReference(reference),
    reference,
    original: '妝飾',
    comparison: '妝飾 / 裝飾',
    sources: 'eBible / Wikisource / CNBible CUV 均作「妝飾」；CNBible CUVMP 部分作「裝飾」。',
    result: '不修正',
    reason: '來源不支持把 CUV 傳統用字批次改成現代字形；不列第一階段錯字。',
  }));
  const lowRows = FIRST_PHASE_LOW_CONFIDENCE_DECISIONS.map(([book, reference, original, comparison, sources, result, reason]) => ({
    confidence: '低',
    book,
    reference,
    original,
    comparison,
    sources,
    result,
    reason,
  }));
  return [...highRows, ...passoverRows, ...adornmentRows, ...lowRows].map((row, index) => ({
    ...row,
    index: index + 1,
  }));
}

function renderMarkdown(report) {
  const issueColumns = [
    { label: '編號', value: row => row.index },
    { label: '書卷', value: row => row.book },
    { label: '經文位置', value: row => row.reference },
    { label: '內建文字片段', value: row => excerpt(row.localText, 55) },
    { label: '對照文字片段', value: row => excerpt(row.referenceText, 55) },
    { label: '差異', value: row => row.difference },
    { label: '判斷分類', value: row => row.category },
    { label: '建議處理', value: row => row.recommendation },
    { label: '信心', value: row => row.confidence },
  ];
  const allIssues = report.bookAudits.flatMap(book => book.knownTokenIssues)
    .map((issue, index) => ({ ...issue, index: index + 1 }));
  const highIssues = allIssues.filter(issue => issue.confidence === '高');
  const mediumIssues = allIssues.filter(issue => issue.confidence === '中');
  const lowIssues = allIssues.filter(issue => issue.confidence === '低');
  const top20 = allIssues.slice().sort((a, b) => {
    const rank = { '高': 0, '中': 1, '低': 2 };
    return rank[a.confidence] - rank[b.confidence] || a.index - b.index;
  }).slice(0, 20);
  const bookStatsRows = report.bookAudits.map(book => ({
    book: book.name,
    entry: book.entryPath,
    testament: book.testament === 'OT' ? '舊約' : '新約',
    chapters: book.localChapterCount,
    verses: book.localVerseCount,
    structure: book.chapterMismatches.length || book.missingInLocal.length || book.missingInReference.length || book.duplicateKeys.length || book.emptyVerses.length ? '需查' : '正常',
  }));
  const bookStatsTable = markdownTable(bookStatsRows, [
    { label: '書卷', value: row => row.book },
    { label: '約別', value: row => row.testament },
    { label: 'Entry', value: row => row.entry },
    { label: '章數', value: row => row.chapters },
    { label: '節數', value: row => row.verses },
    { label: '結構', value: row => row.structure },
  ]);
  const sourceList = report.summary.referenceSources.map(source => `- ${source.name}: ${source.url}。${source.usage}`).join('\n');
  const tokenRows = report.summary.knownTokenOccurrences.map(item => ({
    token: item.token,
    count: item.count,
  }));
  const tokenTable = markdownTable(tokenRows, [
    { label: '掃描項目', value: row => row.token },
    { label: '出現筆數', value: row => row.count },
  ]);
  const classificationRows = Object.entries(report.summary.classificationCounts).map(([classification, count]) => ({ classification, count }));
  const classificationTable = markdownTable(classificationRows, [
    { label: '逐節比對分類', value: row => row.classification },
    { label: '節數', value: row => row.count },
  ]);
  const firstPhaseDecisionRows = buildFirstPhaseDecisionRows();
  const firstPhaseDecisionTable = markdownTable(firstPhaseDecisionRows, [
    { label: '編號', value: row => row.index },
    { label: '書卷', value: row => row.book },
    { label: '經文位置', value: row => row.reference },
    { label: '內建文字', value: row => row.original },
    { label: '對照來源', value: row => row.sources },
    { label: '判斷', value: row => row.comparison },
    { label: '處理結果', value: row => row.result },
    { label: '理由', value: row => row.reason },
  ]);
  const secondPhaseDecisionRows = SECOND_PHASE_POLICY_DECISIONS.map(([book, reference, original, comparison, sources, result, reason], index) => ({
    index: index + 1,
    book,
    reference,
    original,
    comparison,
    sources,
    result,
    reason,
  }));
  const secondPhaseDecisionTable = markdownTable(secondPhaseDecisionRows, [
    { label: '編號', value: row => row.index },
    { label: '書卷', value: row => row.book },
    { label: '經文位置', value: row => row.reference },
    { label: '原文字形', value: row => row.original },
    { label: '決策字形', value: row => row.comparison },
    { label: '來源比對', value: row => row.sources },
    { label: '處理結果', value: row => row.result },
    { label: '理由', value: row => row.reason },
  ]);
  const policyTokenTable = markdownTable(report.summary.policyTokenScan, [
    { label: '項目', value: row => `${row.token} / ${row.expected}` },
    { label: '出現次數', value: row => row.count },
    { label: '分類', value: row => row.decision },
    { label: '處理結果', value: row => row.action },
    { label: '代表位置', value: row => row.references.slice(0, 5).join('、') || '-' },
    { label: '理由', value: row => row.note },
  ]);

  return `# 內建聖經全文校對盤點與第一、第二階段修正報告

## 基本資訊

- 盤點日期：${AUDIT_DATE.slice(0, 4)}-${AUDIT_DATE.slice(4, 6)}-${AUDIT_DATE.slice(6, 8)}
- Repo path：${report.summary.repoPath}
- 內建聖經來源：${report.summary.bibleEpubPath}
- 檢查範圍：整本聖經 66 卷。
- 本報告最初為只讀盤點；已於第一階段新增高 / 中信心比對決策與修正結果，並於第二階段新增字詞政策查驗結果。
- 修正範圍：僅修正第一階段確認應修的內建聖經文字，以及第二階段確認應修的哥林多前書 13:12「糢糊 / 模糊」；未改資料庫、抓取經文程式、UI 或正式使用者資料。

## EPUB Metadata

- Title：${report.summary.metadata.title}
- Identifier：${report.summary.metadata.identifier}
- Language：${report.summary.metadata.language}
- Creator：${report.summary.metadata.creator}
- Modified：${report.summary.metadata.modified}

## 經文抓取來源確認

- \`app.js\` 的 \`DEFAULT_BIBLE_EPUB_PATH\` 指向 \`assets/default-books/bible.epub\`。
- \`loadScriptureBibleEntries()\` 下載此 EPUB 並解壓。
- \`fetchScriptureReference()\` 依書卷 code 讀取 \`OEBPS/text/{BOOK}.xhtml\`，因此內建抓取結果會直接反映本 EPUB 的文字。

## 對照來源

${sourceList}

## 比對方法

1. 解析 \`OEBPS/content.opf\` metadata、manifest 與 spine，確認 66 卷 entry。
2. 逐卷讀取 \`OEBPS/text/*.xhtml\`，抽出 \`.verse[id="v章_節"] .verse-text\`。
3. 下載並解析 eBible \`cmn-cu89t_usfm.zip\`，抽出 66 卷、逐章、逐節文字。
4. 逐節比對並分類：相同、標點差異、繁簡/異體差異、譯本差異、註記格式差異、章節結構差異、待人工確認。
5. 額外掃描已知 OCR / 異常字族群：餧、餕、繙、踰越節、妝飾、糢糊、衆、亂碼。
6. 第二階段額外掃描字形政策項目：糢、糢糊、裏、衆、于、祇、纔、爲、着。
7. 本輪不把不同譯本用詞、標點、小字註記或異體字直接當錯字；來源不一致時依使用者指定的字詞政策逐條判斷。

## 完整性摘要

- 書卷數：${report.summary.bookCount}
- 舊約：${report.summary.oldTestamentBookCount} 卷
- 新約：${report.summary.newTestamentBookCount} 卷
- OPF text entry：${report.summary.opfEntryCount} 個
- 內建總節數：${report.summary.totalLocalVerses}
- 對照來源展開後總節數：${report.summary.totalReferenceVerses}
- 結構異常筆數：${report.summary.structureIssueCount}
- 疑似問題總數：${report.summary.suspectedIssueCount}
- 高信心：${report.summary.confidenceCounts['高']}
- 中信心：${report.summary.confidenceCounts['中']}
- 低信心：${report.summary.confidenceCounts['低']}

## 逐節比對分類統計

${classificationTable}

## 書卷完整性統計

${bookStatsTable}

## 已知問題掃描結果

${tokenTable}

## 最嚴重前 20 筆

${top20.length ? markdownTable(top20, issueColumns) : '未找到高優先疑似問題。'}

## 疑似錯別字總表

${allIssues.length ? markdownTable(allIssues, issueColumns) : '未找到疑似錯別字。'}

## 第一階段高 / 中信心項目比對與修正結果

- 原高信心：${FIRST_PHASE_HIGH_CONFIDENCE_DECISIONS.length} 筆，修正 ${FIRST_PHASE_HIGH_CONFIDENCE_DECISIONS.length} 筆。
- 原中信心：${PASSOVER_REFS.length + ADORNMENT_REFS.length} 筆，修正 ${PASSOVER_REFS.length} 筆，不修正 ${ADORNMENT_REFS.length} 筆，待人工確認 0 筆。
- 原低信心：${FIRST_PHASE_LOW_CONFIDENCE_DECISIONS.length} 筆，第一階段列待人工確認 ${FIRST_PHASE_LOW_CONFIDENCE_DECISIONS.length} 筆；第二階段已處理並修正 ${SECOND_PHASE_POLICY_DECISIONS.length} 筆。
- 節號差異：${report.summary.structureIssueCount} 筆，本輪不修正；這類屬公開來源的節號保留 / 省略 / 分節差異，後續若要處理，需另開「章節結構政策」任務。

${firstPhaseDecisionTable}

## 第二階段：字詞政策查驗結果

### 判斷原則

- 多個可信和合本繁體來源一致使用現代常用字，且修正不改變經文意思時，可以修正。
- 可信來源普遍保留傳統用字，或只是可接受異體字 / 現代化偏好時，不修正。
- 來源不一致且牽涉版本差異、註記格式或章節結構時，才列待人工確認或另案處理。

### 哥林多前書 13:12 糢糊 / 模糊

${secondPhaseDecisionTable}

### 全本其他字形政策項目掃描

${policyTokenTable}

### 版本與部署

- 本輪有修改 \`assets/default-books/bible.epub\`，因此版本由 v1.1.6 升至 v1.1.7。
- \`DEFAULT_BIBLE_ASSET_VERSION\` 更新為 \`2026.06.07-word-policy-v1.1.7\`，確保前端重新載入新版內建聖經。
- Production commit hash：完成 production deployment 後於完成回報提供。

## 高信心項目

${highIssues.length ? markdownTable(highIssues, issueColumns) : '本輪未找到高信心項目。'}

## 中信心項目

${mediumIssues.length ? markdownTable(mediumIssues, issueColumns) : '本輪未找到中信心項目。'}

## 低信心項目

${lowIssues.length ? markdownTable(lowIssues, issueColumns) : '本輪未找到低信心項目。'}

## 待人工確認清單

- 字詞政策項目：本輪沒有剩餘待人工確認的正文用字項目。
- 節號差異：屬公開來源的節號保留 / 省略 / 分節差異；本輪不修，後續需另開「章節結構政策」任務。

## 不建議本輪修正項目

- \`神 / 上帝\`：屬對照來源版本差異。
- \`裡 / 裏\`、\`著 / 着\`、\`為 / 爲\`、\`眾 / 衆\`：目前內建 EPUB 已採 \`裡\`、\`著\`、\`為\`、\`眾\`，沒有需要修正的舊字形。
- \`于 / 於\`：目前唯一 \`于\` 為歷代志上 3:20 人名 \`于沙希悉\`，不修正。
- \`妝飾 / 裝飾\`：eBible、Wikisource、CNBible CUV 均支持「妝飾」，不應因 CUVMP 現代字形偏好批次更動。
- 小字註記位置、括號格式、標點：除非影響閱讀或造成正文錯置，建議不列第一階段。
- USFM 中少數節號範圍造成的比對限制：本輪只用於結構檢查，不直接視為內建缺節。

## 哥林多前書已修正項目追蹤

- 哥林多前書 3:2：本輪全本掃描未再發現 \`餧\` 於哥林多前書；文字為 \`奶餵 / 飯餵\`。
- 哥林多前書 12:10：本輪全本掃描未再發現 \`繙方言\` 於哥林多前書；文字為 \`翻方言\`。
- 哥林多前書 13:12：第二階段已將 \`糢糊不清\` 修正為 \`模糊不清\`，正文與小字註記同步更新。
- 哥林多前書 5:7、12:24、12:30、14:5、14:13、14:26、14:27、14:28 已於 v1.1.5 修正並由既有驗證腳本覆蓋。

## 分階段修正建議

### 階段 1：已修高信心與來源一致支持的中信心錯字

- 已修正 \`餧 -> 餵\`、\`繙 -> 翻\`。
- 已修正三個可信來源一致支持的 \`踰越節 -> 逾越節\`。
- 每次修正後重打包 EPUB，跑 \`npm run verify\` 與完整 audit script。
- 獨立 patch 版本，不與中低信心項目混在同一版。

### 階段 2：字形政策項目

- 已依使用者要求逐條查驗 \`糢糊 -> 模糊\` 這類來源不一致或字形政策項目。
- 哥林多前書 13:12 已修正為 \`模糊不清\`。
- \`妝飾\` 目前判定不修；若未來採 CUVMP 現代字形政策，再另案處理。
- 本階段以 patch 版本與 changelog 獨立記錄。

### 階段 3：註記、標點、異體字暫緩

- 括號註記、標點、其他異體字建議待使用者指定更完整政策後再處理。
- 若不影響閱讀，不建議大規模改動整本聖經。

## Git Status

\`\`\`text
${report.summary.gitStatusShort}
\`\`\`

## 腳本與輸出

本報告由 \`node scripts/audit-bible-text.mjs\` 產出。完成後請以 \`git status\` 確認：預期只新增本報告與 \`scripts/audit-bible-text.mjs\`，以及 ignored \`artifacts/\` JSON 輸出。
`;
}

function main() {
  if (!existsSync(BIBLE_EPUB_PATH)) throw new Error(`${BIBLE_EPUB_PATH} not found`);
  ensureReferenceZip();
  const opf = run('unzip', ['-p', BIBLE_EPUB_PATH, 'OEBPS/content.opf']);
  const opfMetadata = parseOpfMetadata(opf);
  const opfEntries = parseOpfEntries(opf);
  const usfmFiles = listUsfmFiles();
  const bookAudits = BOOKS.map(book => buildBookAudit(book, opfEntries, usfmFiles));
  const summary = aggregate(bookAudits, opfMetadata, opfEntries);
  const report = { summary, bookAudits };
  writeFileSync(JSON_REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(MARKDOWN_REPORT_PATH, renderMarkdown(report));
  console.log(`Bible text audit completed`);
  console.log(`Markdown report: ${MARKDOWN_REPORT_PATH}`);
  console.log(`JSON report: ${JSON_REPORT_PATH}`);
  console.log(`Books: ${summary.bookCount} (${summary.oldTestamentBookCount} OT / ${summary.newTestamentBookCount} NT)`);
  console.log(`Local verses: ${summary.totalLocalVerses}`);
  console.log(`Reference verses: ${summary.totalReferenceVerses}`);
  console.log(`Suspected issues: ${summary.suspectedIssueCount} (high ${summary.confidenceCounts['高']}, medium ${summary.confidenceCounts['中']}, low ${summary.confidenceCounts['低']})`);
  console.log(`Structure issues: ${summary.structureIssueCount}`);
}

main();
