import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const AUDIT_DATE = process.env.AUDIT_DATE || '20260607';
const REPO_PATH = process.cwd();
const BIBLE_EPUB_PATH = 'assets/default-books/bible.epub';
const EBIBLE_USFM_URL = 'https://ebible.org/Scriptures/cmn-cu89t_usfm.zip';
const WIKISOURCE_BASE_URL = 'https://zh.wikisource.org/wiki/聖經_(和合本)';
const CNBIBLE_BASE_URL = 'https://cnbible.com';
const ARTIFACTS_DIR = process.env.AUDIT_ARTIFACTS_DIR || path.join(REPO_PATH, 'artifacts');
const CACHE_DIR = path.join(ARTIFACTS_DIR, 'bible-text-audit-cache');
const SOURCE_CACHE_DIR = path.join(CACHE_DIR, 'source-pages');
const EBIBLE_ZIP_PATH = path.join(CACHE_DIR, 'cmn-cu89t_usfm.zip');
const JSON_REPORT_PATH = path.join(ARTIFACTS_DIR, `bible-text-full-comprehensive-audit-${AUDIT_DATE}.json`);
const MARKDOWN_REPORT_PATH = path.join(REPO_PATH, `BIBLE_TEXT_FULL_COMPREHENSIVE_AUDIT_${AUDIT_DATE}.md`);
const CHAPTER_STRUCTURE_JSON_PATH = path.join(ARTIFACTS_DIR, `bible-chapter-structure-audit-${AUDIT_DATE}.json`);
const CNBIBLE_SNIPPET_LIMIT = Number(process.env.CNBIBLE_SNIPPET_LIMIT || 180);

const BOOKS = [
  ['GEN', '創世記', 'OT', '摩西五經', 'genesis', '創世記'],
  ['EXO', '出埃及記', 'OT', '摩西五經', 'exodus', '出埃及記'],
  ['LEV', '利未記', 'OT', '摩西五經', 'leviticus', '利未記'],
  ['NUM', '民數記', 'OT', '摩西五經', 'numbers', '民數記'],
  ['DEU', '申命記', 'OT', '摩西五經', 'deuteronomy', '申命記'],
  ['JOS', '約書亞記', 'OT', '歷史書', 'joshua', '約書亞記'],
  ['JDG', '士師記', 'OT', '歷史書', 'judges', '士師記'],
  ['RUT', '路得記', 'OT', '歷史書', 'ruth', '路得記'],
  ['1SA', '撒母耳記上', 'OT', '歷史書', '1_samuel', '撒母耳記上'],
  ['2SA', '撒母耳記下', 'OT', '歷史書', '2_samuel', '撒母耳記下'],
  ['1KI', '列王紀上', 'OT', '歷史書', '1_kings', '列王紀上'],
  ['2KI', '列王紀下', 'OT', '歷史書', '2_kings', '列王紀下'],
  ['1CH', '歷代志上', 'OT', '歷史書', '1_chronicles', '歷代志上'],
  ['2CH', '歷代志下', 'OT', '歷史書', '2_chronicles', '歷代志下'],
  ['EZR', '以斯拉記', 'OT', '歷史書', 'ezra', '以斯拉記'],
  ['NEH', '尼希米記', 'OT', '歷史書', 'nehemiah', '尼希米記'],
  ['EST', '以斯帖記', 'OT', '歷史書', 'esther', '以斯帖記'],
  ['JOB', '約伯記', 'OT', '智慧書', 'job', '約伯記'],
  ['PSA', '詩篇', 'OT', '智慧書', 'psalms', '詩篇'],
  ['PRO', '箴言', 'OT', '智慧書', 'proverbs', '箴言'],
  ['ECC', '傳道書', 'OT', '智慧書', 'ecclesiastes', '傳道書'],
  ['SNG', '雅歌', 'OT', '智慧書', 'song_solomon', '雅歌'],
  ['ISA', '以賽亞書', 'OT', '大先知書', 'isaiah', '以賽亞書'],
  ['JER', '耶利米書', 'OT', '大先知書', 'jeremiah', '耶利米書'],
  ['LAM', '耶利米哀歌', 'OT', '大先知書', 'lamentations', '耶利米哀歌'],
  ['EZK', '以西結書', 'OT', '大先知書', 'ezekiel', '以西結書'],
  ['DAN', '但以理書', 'OT', '大先知書', 'daniel', '但以理書'],
  ['HOS', '何西阿書', 'OT', '小先知書', 'hosea', '何西阿書'],
  ['JOL', '約珥書', 'OT', '小先知書', 'joel', '約珥書'],
  ['AMO', '阿摩司書', 'OT', '小先知書', 'amos', '阿摩司書'],
  ['OBA', '俄巴底亞書', 'OT', '小先知書', 'obadiah', '俄巴底亞書'],
  ['JON', '約拿書', 'OT', '小先知書', 'jonah', '約拿書'],
  ['MIC', '彌迦書', 'OT', '小先知書', 'micah', '彌迦書'],
  ['NAM', '那鴻書', 'OT', '小先知書', 'nahum', '那鴻書'],
  ['HAB', '哈巴谷書', 'OT', '小先知書', 'habakkuk', '哈巴谷書'],
  ['ZEP', '西番雅書', 'OT', '小先知書', 'zephaniah', '西番雅書'],
  ['HAG', '哈該書', 'OT', '小先知書', 'haggai', '哈該書'],
  ['ZEC', '撒迦利亞書', 'OT', '小先知書', 'zechariah', '撒迦利亞書'],
  ['MAL', '瑪拉基書', 'OT', '小先知書', 'malachi', '瑪拉基書'],
  ['MAT', '馬太福音', 'NT', '四福音', 'matthew', '馬太福音'],
  ['MRK', '馬可福音', 'NT', '四福音', 'mark', '馬可福音'],
  ['LUK', '路加福音', 'NT', '四福音', 'luke', '路加福音'],
  ['JHN', '約翰福音', 'NT', '四福音', 'john', '約翰福音'],
  ['ACT', '使徒行傳', 'NT', '使徒行傳', 'acts', '使徒行傳'],
  ['ROM', '羅馬書', 'NT', '保羅書信', 'romans', '羅馬書'],
  ['1CO', '哥林多前書', 'NT', '保羅書信', '1_corinthians', '哥林多前書'],
  ['2CO', '哥林多後書', 'NT', '保羅書信', '2_corinthians', '哥林多後書'],
  ['GAL', '加拉太書', 'NT', '保羅書信', 'galatians', '加拉太書'],
  ['EPH', '以弗所書', 'NT', '保羅書信', 'ephesians', '以弗所書'],
  ['PHP', '腓立比書', 'NT', '保羅書信', 'philippians', '腓立比書'],
  ['COL', '歌羅西書', 'NT', '保羅書信', 'colossians', '歌羅西書'],
  ['1TH', '帖撒羅尼迦前書', 'NT', '保羅書信', '1_thessalonians', '帖撒羅尼迦前書'],
  ['2TH', '帖撒羅尼迦後書', 'NT', '保羅書信', '2_thessalonians', '帖撒羅尼迦後書'],
  ['1TI', '提摩太前書', 'NT', '保羅書信', '1_timothy', '提摩太前書'],
  ['2TI', '提摩太後書', 'NT', '保羅書信', '2_timothy', '提摩太後書'],
  ['TIT', '提多書', 'NT', '保羅書信', 'titus', '提多書'],
  ['PHM', '腓利門書', 'NT', '保羅書信', 'philemon', '腓利門書'],
  ['HEB', '希伯來書', 'NT', '普通書信', 'hebrews', '希伯來書'],
  ['JAS', '雅各書', 'NT', '普通書信', 'james', '雅各書'],
  ['1PE', '彼得前書', 'NT', '普通書信', '1_peter', '彼得前書'],
  ['2PE', '彼得後書', 'NT', '普通書信', '2_peter', '彼得後書'],
  ['1JN', '約翰一書', 'NT', '普通書信', '1_john', '約翰一書'],
  ['2JN', '約翰二書', 'NT', '普通書信', '2_john', '約翰二書'],
  ['3JN', '約翰三書', 'NT', '普通書信', '3_john', '約翰三書'],
  ['JUD', '猶大書', 'NT', '普通書信', 'jude', '猶大書'],
  ['REV', '啟示錄', 'NT', '啟示錄', 'revelation', '啟示錄'],
].map(([code, name, testament, group, cnbibleSlug, wikiPath], index) => ({
  code,
  name,
  testament,
  group,
  cnbibleSlug,
  wikiPath,
  order: index + 1,
  entryPath: `OEBPS/text/${code}.xhtml`,
}));

const GROUP_ORDER = ['摩西五經', '歷史書', '智慧書', '大先知書', '小先知書', '四福音', '使徒行傳', '保羅書信', '普通書信', '啟示錄'];

const VARIANT_POLICY_RULES = [
  ['裏', '裡'],
  ['衆', '眾'],
  ['爲', '為'],
  ['着', '著'],
  ['于', '於'],
  ['祇', '只'],
  ['纔', '才'],
  ['牀', '床'],
  ['竈', '灶'],
  ['麪', '麵'],
  ['麵', '麪'],
  ['羣', '群'],
  ['啓', '啟'],
  ['祕', '秘'],
  ['蹟', '跡'],
  ['覩', '睹'],
  ['讚', '贊'],
  ['髮', '發'],
  ['髒', '臟'],
  ['塲', '場'],
  ['汚', '污'],
  ['喫', '吃'],
  ['躭', '耽'],
  ['麼', '嗎'],
  ['凶', '兇'],
  ['兇', '凶'],
];

const SUSPICIOUS_SHAPE_CHARS = [
  '餧',
  '餕',
  '繙',
  '糢',
  '衆',
  '爲',
  '牀',
  '竈',
  '麪',
  '羣',
  '啓',
  '覩',
  '髒',
  '塲',
  '汚',
  '躭',
  '喫',
  '讚',
  '蹟',
];

const VERSION_TERM_NORMALIZATIONS = [
  ['上帝', '神'],
  ['裏', '裡'],
  ['着', '著'],
  ['爲', '為'],
  ['衆', '眾'],
  ['羣', '群'],
  ['牀', '床'],
  ['竈', '灶'],
  ['麪', '麵'],
  ['塲', '場'],
  ['汚', '污'],
  ['喫', '吃'],
  ['糢', '模'],
  ['踰', '逾'],
  ['繙', '翻'],
  ['餧', '餵'],
  ['希臘', '希利尼'],
  ['司提法那', '司提反'],
  ['哪裏', '那裡'],
  ['哪裡', '那裡'],
  ['他', '她'],
  ['它', '她'],
];

function run(command, args = [], options = {}) {
  return execFileSync(command, args, {
    encoding: options.encoding || 'utf8',
    maxBuffer: options.maxBuffer || 100 * 1024 * 1024,
  });
}

function ensureArtifacts() {
  mkdirSync(CACHE_DIR, { recursive: true });
  mkdirSync(SOURCE_CACHE_DIR, { recursive: true });
}

function ensureReferenceZip() {
  ensureArtifacts();
  if (existsSync(EBIBLE_ZIP_PATH)) return;
  run('curl', ['-fsSL', '--connect-timeout', '8', '--max-time', '45', '--retry', '1', EBIBLE_USFM_URL, '-o', EBIBLE_ZIP_PATH], { maxBuffer: 10 * 1024 * 1024 });
}

function cachePathForUrl(url) {
  const safe = Buffer.from(url).toString('base64url');
  return path.join(SOURCE_CACHE_DIR, `${safe}.html`);
}

function fetchCached(url) {
  const cachePath = cachePathForUrl(url);
  if (existsSync(cachePath)) return readFileSync(cachePath, 'utf8');
  try {
    const html = run('curl', ['-fsSL', '--connect-timeout', '8', '--max-time', '25', '--retry', '1', url], { maxBuffer: 30 * 1024 * 1024 });
    writeFileSync(cachePath, html);
    return html;
  } catch (error) {
    return '';
  }
}

function decodeHtml(value = '') {
  return String(value || '')
    .replace(/&nbsp;|&#8239;/g, ' ')
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
  const readTag = tag => stripTags(opf.match(new RegExp(`<dc:${tag}[^>]*>([\\s\\S]*?)<\\/dc:${tag}>`))?.[1] || '');
  return {
    identifier: stripTags(opf.match(/<dc:identifier[^>]*>([\s\S]*?)<\/dc:identifier>/)?.[1] || ''),
    title: readTag('title'),
    language: readTag('language'),
    creator: readTag('creator'),
    modified: stripTags(opf.match(/<meta[^>]*property="dcterms:modified"[^>]*>([\s\S]*?)<\/meta>/)?.[1] || ''),
  };
}

function parseOpfEntries(opf = '') {
  const manifestEntries = [...opf.matchAll(/<item\s+([^>]+?)\/>/g)].map(match => {
    const attrs = match[1];
    return {
      id: attrs.match(/\bid="([^"]+)"/)?.[1] || '',
      href: attrs.match(/\bhref="([^"]+)"/)?.[1] || '',
    };
  });
  const spineIds = [...opf.matchAll(/<itemref\s+[^>]*idref="([^"]+)"/g)].map(match => match[1]);
  const byId = new Map(manifestEntries.map(entry => [entry.id, entry]));
  return spineIds
    .map(id => byId.get(id))
    .filter(entry => entry?.href?.startsWith('text/'))
    .map(entry => `OEBPS/${entry.href}`);
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
    .replace(/\\f\s+[\s\S]*?\\f\*/g, ' ')
    .replace(/\\x\s+[\s\S]*?\\x\*/g, ' ')
    .replace(/\\\+?[a-z0-9]+\*?/gi, ' ')
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

function parseWikisourceVerses(html = '') {
  const verses = [];
  const pattern = /<span[^>]*id="(\d+):(\d+)"[^>]*>[\s\S]*?<\/span>([\s\S]*?)(?=<\/p><p><span[^>]*id="\d+:\d+"|<p><span[^>]*id="\d+:\d+"|<div class="mw-heading|$)/g;
  let match;
  while ((match = pattern.exec(html))) {
    const chapter = Number(match[1]);
    const verse = Number(match[2]);
    verses.push({
      chapter,
      verse,
      key: `${chapter}:${verse}`,
      text: stripTags(match[3]),
    });
  }
  return verses;
}

function summarizeChapters(verses = []) {
  const byChapter = new Map();
  for (const verse of verses) {
    if (!byChapter.has(verse.chapter)) byChapter.set(verse.chapter, []);
    byChapter.get(verse.chapter).push(verse.verse);
  }
  return [...byChapter.entries()].sort((a, b) => a[0] - b[0]).map(([chapter, chapterVerses]) => ({
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

function normalizeWhitespace(value = '') {
  return String(value || '').replace(/\s+/g, '').replace(/\u3000/g, '');
}

function removePunctuation(value = '') {
  return normalizeWhitespace(value).replace(/[，。；：、！？「」『』（）()《》〈〉—－\-…·．,.!?;:"'“”‘’\[\]【】]/g, '');
}

function normalizeVariants(value = '') {
  let normalized = removePunctuation(value);
  for (const [from, to] of VERSION_TERM_NORMALIZATIONS) {
    normalized = normalized.replace(new RegExp(from, 'g'), to);
  }
  return normalized;
}

function classifyDifference(localText = '', referenceText = '', { isRangeSource = false } = {}) {
  if (!referenceText) return '章節結構差異';
  if (localText === referenceText) return '相同';
  if (isRangeSource) return '章節結構差異';
  if (normalizeWhitespace(localText) === normalizeWhitespace(referenceText)) return '標點差異';
  if (removePunctuation(localText) === removePunctuation(referenceText)) return '標點差異';
  if (normalizeVariants(localText) === normalizeVariants(referenceText)) return '譯本 / 版本差異';
  if (/[（(].{1,36}(原文|有古卷|或作|小字|或譯)[^）)]*[）)]/.test(localText) || /有古卷|原文|或譯/.test(referenceText)) return '註記格式差異';
  return '待人工確認';
}

function excerpt(value = '', length = 70) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  return normalized.length > length ? `${normalized.slice(0, length)}...` : normalized;
}

function countHanChars(bookAudits) {
  const counts = new Map();
  const examples = new Map();
  for (const book of bookAudits) {
    for (const verse of book.localVerses) {
      for (const char of verse.text.match(/\p{Script=Han}/gu) || []) {
        counts.set(char, (counts.get(char) || 0) + 1);
        if (!examples.has(char)) {
          examples.set(char, {
            book: book.name,
            code: book.code,
            group: book.group,
            reference: `${book.name} ${verse.key}`,
            text: verse.text,
          });
        }
      }
    }
  }
  return [...counts.entries()].map(([char, count]) => ({ char, count, example: examples.get(char) })).sort((a, b) => a.count - b.count || a.char.localeCompare(b.char, 'zh-Hant'));
}

function hasUnbalancedBrackets(text = '') {
  const pairs = [
    ['（', '）'],
    ['(', ')'],
    ['「', '」'],
    ['『', '』'],
    ['《', '》'],
    ['〈', '〉'],
  ];
  return pairs.some(([open, close]) => {
    const openCount = [...text].filter(char => char === open).length;
    const closeCount = [...text].filter(char => char === close).length;
    return openCount !== closeCount;
  });
}

function issueKey(issue) {
  return `${issue.category}|${issue.reference}|${issue.suspect}`;
}

function addIssue(issues, issue) {
  const key = issueKey(issue);
  if (issues.some(existing => issueKey(existing) === key)) return;
  issues.push(issue);
}

function buildIssue({ index = 0, book, verse, localText = verse?.text || '', referenceText = '', suspect, category, recommendation, confidence, reason, source = '' }) {
  return {
    index,
    book: book.name,
    code: book.code,
    group: book.group,
    reference: verse ? `${book.name} ${verse.key}` : book.name,
    localText,
    referenceText,
    suspect,
    category,
    recommendation,
    confidence,
    reason,
    source,
  };
}

function scanPolicyIssues(bookAudits) {
  const issues = [];
  const policySummary = [];
  for (const [from, to] of VARIANT_POLICY_RULES) {
    const hits = [];
    for (const book of bookAudits) {
      for (const verse of book.localVerses) {
        if (!verse.text.includes(from)) continue;
        hits.push({ book, verse, count: verse.text.split(from).length - 1 });
      }
    }
    policySummary.push({
      item: `${from} / ${to}`,
      count: hits.reduce((sum, hit) => sum + hit.count, 0),
      references: hits.slice(0, 8).map(hit => `${hit.book.name} ${hit.verse.key}`),
      decision: hits.length ? '待人工確認或依字形政策處理' : '未出現',
    });
    for (const hit of hits.slice(0, 80)) {
      addIssue(issues, buildIssue({
        book: hit.book,
        verse: hit.verse,
        suspect: `${from} / ${to}`,
        category: '字形政策差異',
        recommendation: from === '于' ? '建議保留' : '待人工確認',
        confidence: '低',
        reason: from === '于'
          ? '需先確認是否為人名或地名用字，不可直接改成「於」。'
          : '屬可能的異體字 / 現代字形政策項目，需依全站文字政策決定。',
      }));
    }
  }
  return { issues, policySummary };
}

function scanTextQualityIssues(bookAudits) {
  const issues = [];
  for (const book of bookAudits) {
    for (const verse of book.localVerses) {
      const text = verse.text;
      if (hasUnbalancedBrackets(text)) {
        addIssue(issues, buildIssue({
          book,
          verse,
          suspect: '括號 / 引號未成對',
          category: '標點差異',
          recommendation: '待人工確認',
          confidence: '中',
          reason: '同一節內括號或引號數量不成對；可能是跨節引號，也可能是排版問題。',
        }));
      }
      if (/[()]/.test(text) && /(原文|有古卷|或作|小字|或譯|的或作)/.test(text)) {
        addIssue(issues, buildIssue({
          book,
          verse,
          suspect: '半形括號註記',
          category: '註記格式差異',
          recommendation: '待人工確認',
          confidence: '中',
          reason: '註記使用半形括號，可能和全本中文排版不一致，需確認是否影響閱讀。',
        }));
      }
      if (/[（(](的或作為|原文作|有古卷作|小字作|或作)[^）)]*[）)]/.test(text) || /[（(][^）)]{0,8}(原文|有古卷|或作|小字|或譯)[^）)]*[）)]/.test(text)) {
        addIssue(issues, buildIssue({
          book,
          verse,
          suspect: '小字註記位置 / 措辭',
          category: '註記格式差異',
          recommendation: '待人工確認',
          confidence: '低',
          reason: '內文含小字註記，需確認註記是否與正文黏連或標點位置是否自然。',
        }));
      }
      if (/[，。；：、！？]{2,}/.test(text) || /[！？][，。]/.test(text)) {
        addIssue(issues, buildIssue({
          book,
          verse,
          suspect: '連續標點',
          category: '標點差異',
          recommendation: '待人工確認',
          confidence: '中',
          reason: '出現連續標點或不尋常標點組合，可能是轉檔排版問題。',
        }));
      }
      if (/[\uFFFD\uE000-\uF8FF]/u.test(text)) {
        addIssue(issues, buildIssue({
          book,
          verse,
          suspect: '亂碼 / 私用區字元',
          category: '確認錯字',
          recommendation: '建議修正',
          confidence: '高',
          reason: '出現 replacement 或私用區字元，通常是轉檔異常。',
        }));
      }
      for (const char of SUSPICIOUS_SHAPE_CHARS) {
        if (!text.includes(char)) continue;
        addIssue(issues, buildIssue({
          book,
          verse,
          suspect: `疑似形近 / 罕見字：${char}`,
          category: '高度疑似錯字',
          recommendation: '待人工確認',
          confidence: ['餧', '餕', '繙', '糢'].includes(char) ? '中' : '低',
          reason: '此字屬前輪錯字類型或罕見轉檔風險字；本輪只列疑點，不直接修。',
        }));
      }
    }
  }
  return issues;
}

function scanLowFrequencyIssues(bookAudits, charFrequencyRows) {
  const issues = [];
  const excludedChars = new Set('一二三四五六七八九十百千萬人天地神王子女山水火土金木日月主耶和華以色列亞伯拉罕雅各摩西大衛約瑟保羅彼得耶穌基督');
  const candidates = charFrequencyRows
    .filter(row => row.count <= 2)
    .filter(row => !excludedChars.has(row.char))
    .filter(row => {
      const codePoint = row.char.codePointAt(0);
      return codePoint >= 0x3400 && codePoint <= 0x9fff;
    })
    .slice(0, 120);
  for (const row of candidates) {
    const book = BOOKS.find(item => item.code === row.example.code);
    const [chapter, verse] = row.example.reference.split(' ').at(-1).split(':').map(Number);
    addIssue(issues, buildIssue({
      book,
      verse: { key: `${chapter}:${verse}`, text: row.example.text },
      suspect: `低頻字：${row.char}（全本 ${row.count} 次）`,
      category: '待人工確認',
      recommendation: '待人工確認',
      confidence: '低',
      reason: '低頻字不等於錯字；列出供人工確認是否為人名、地名、傳統用字或轉檔錯字。',
    }));
  }
  return issues;
}

function scanCrossSourceIssues(bookAudits) {
  const issues = [];
  const comparisonSummary = {};
  for (const book of bookAudits) {
    for (const localVerse of book.localVerses) {
      const eBibleVerse = book.eBibleByKey.get(localVerse.key);
      const wikiVerse = book.wikisourceByKey.get(localVerse.key);
      const eBibleClass = classifyDifference(localVerse.text, eBibleVerse?.text || '', { isRangeSource: !!eBibleVerse?.isRangeSource });
      const wikiClass = classifyDifference(localVerse.text, wikiVerse?.text || '');
      comparisonSummary[eBibleClass] = (comparisonSummary[eBibleClass] || 0) + 1;
      if (wikiVerse) comparisonSummary[`Wikisource ${wikiClass}`] = (comparisonSummary[`Wikisource ${wikiClass}`] || 0) + 1;

      const bothAvailable = eBibleVerse?.text && wikiVerse?.text;
      const differsAfterNormalization = bothAvailable
        && normalizeVariants(localVerse.text) !== normalizeVariants(eBibleVerse.text)
        && normalizeVariants(localVerse.text) !== normalizeVariants(wikiVerse.text);
      if (!differsAfterNormalization) continue;
      if (/[（(].{1,36}(原文|有古卷|或作|小字|或譯)[^）)]*[）)]/.test(localVerse.text)) continue;
      if (issues.length >= 80) continue;
      addIssue(issues, buildIssue({
        book,
        verse: localVerse,
        referenceText: `eBible: ${eBibleVerse.text} / Wikisource: ${wikiVerse.text}`,
        suspect: '多來源文字差異',
        category: '待人工確認',
        recommendation: '待人工確認',
        confidence: '低',
        reason: '內建文字與 eBible、Wikisource 在去標點與常見字形/版本詞正規化後仍不同；需人工確認是否為版本差異或可疑錯字。',
      }));
    }
  }
  return { issues, comparisonSummary };
}

function buildBookAudit(book, opfEntries, usfmFiles) {
  const xhtml = run('unzip', ['-p', BIBLE_EPUB_PATH, book.entryPath]);
  const { verses: localVerses, duplicateKeys } = extractEpubVerses(xhtml);
  const usfmFile = getUsfmFileForBook(usfmFiles, book.code);
  const usfmText = usfmFile ? run('unzip', ['-p', EBIBLE_ZIP_PATH, usfmFile]) : '';
  const { verses: eBibleVerses, verseRanges } = parseUsfmBook(usfmText);
  const wikiUrl = `${WIKISOURCE_BASE_URL}/${encodeURIComponent(book.wikiPath)}`;
  let wikisourceVerses = [];
  try {
    wikisourceVerses = parseWikisourceVerses(fetchCached(wikiUrl));
  } catch (error) {
    wikisourceVerses = [];
  }
  const chapters = summarizeChapters(localVerses);
  return {
    ...book,
    opfListed: opfEntries.includes(book.entryPath),
    localVerses,
    localByKey: new Map(localVerses.map(verse => [verse.key, verse])),
    eBibleVerses,
    eBibleByKey: new Map(eBibleVerses.map(verse => [verse.key, verse])),
    wikisourceVerses,
    wikisourceByKey: new Map(wikisourceVerses.map(verse => [verse.key, verse])),
    chapterCount: chapters.length,
    verseCount: localVerses.length,
    chapters,
    duplicateKeys,
    emptyVerses: localVerses.filter(verse => !verse.text.trim()).map(verse => verse.key),
    verseRanges,
  };
}

function getUsfmFileForBook(files, code) {
  return files.find(file => new RegExp(`-${code}cmn-cu89t\\.usfm$`).test(file)) || '';
}

function buildStructureIssues() {
  if (!existsSync(CHAPTER_STRUCTURE_JSON_PATH)) return [];
  const report = JSON.parse(readFileSync(CHAPTER_STRUCTURE_JSON_PATH, 'utf8'));
  return (report.structureRows || []).map(row => ({
    index: 0,
    book: row.book,
    code: BOOKS.find(book => book.name === row.book)?.code || '',
    group: BOOKS.find(book => book.name === row.book)?.group || '',
    reference: row.location,
    localText: row.localStatus,
    referenceText: `eBible: ${row.eBibleStatus} / Wikisource: ${row.wikisourceStatus} / CNBible: ${row.cnbibleStatus}`,
    suspect: row.type,
    category: '章節結構差異',
    recommendation: row.decision === '不建議修正' ? '另案處理' : '待人工確認',
    confidence: '低',
    reason: row.decision === '不建議修正'
      ? '第三階段已確認為來源分節或註記呈現差異，本輪不修。'
      : '章節結構差異需另案確認，不應直接修。',
    source: 'chapter-structure-audit',
  }));
}

function extractCnbibleVerse(html = '', slug, chapter, verse, { modernPunctuation = false } = {}) {
  if (!html) return '';
  if (!modernPunctuation) {
    const pattern = new RegExp(`<span class="reftext"><a href="/${slug}/${chapter}-${verse}\\.htm"><b>${verse}<\\/b><\\/a><\\/span><span class="maintext">([\\s\\S]*?)(?=<span class="reftext"><a href="/${slug}/${chapter}-\\d+\\.htm"|<\\/div>)`);
    return stripTags(html.match(pattern)?.[1] || '');
  }
  const marker = `<a href="/${slug}/${chapter}-${verse}.htm" class="reftext">`;
  const index = html.indexOf(marker);
  if (index < 0) return '';
  const next = html.slice(index + marker.length).search(new RegExp(`<a href="/${slug}/${chapter}-\\d+\\.htm" class="reftext">`));
  const fragment = next >= 0 ? html.slice(index, index + marker.length + next) : html.slice(index, index + 3000);
  return stripTags(fragment).replace(new RegExp(`^${verse}\\s*`), '').trim();
}

function attachCnbibleSnippets(issues) {
  const cnbibleCandidateKeys = new Set(
    issues
      .slice()
      .sort((a, b) => rankIssue(a) - rankIssue(b))
      .slice(0, CNBIBLE_SNIPPET_LIMIT)
      .map(issueKey)
  );
  const cache = new Map();
  function getChapter(book, chapter, version) {
    const key = `${version}:${book.cnbibleSlug}:${chapter}`;
    if (cache.has(key)) return cache.get(key);
    const url = `${CNBIBLE_BASE_URL}/${version}/${book.cnbibleSlug}/${chapter}.htm`;
    try {
      const html = fetchCached(url);
      cache.set(key, html);
      return html;
    } catch (error) {
      cache.set(key, '');
      return '';
    }
  }
  return issues.map(issue => {
    if (!cnbibleCandidateKeys.has(issueKey(issue))) return issue;
    const book = BOOKS.find(item => item.code === issue.code || item.name === issue.book);
    const verseMatch = issue.reference.match(/(\d+):(\d+)/);
    if (!book || !verseMatch) return issue;
    const chapter = Number(verseMatch[1]);
    const verse = Number(verseMatch[2]);
    const cuv = extractCnbibleVerse(getChapter(book, chapter, 'cu'), book.cnbibleSlug, chapter, verse);
    const cuvmp = extractCnbibleVerse(getChapter(book, chapter, 'cuvmpt'), book.cnbibleSlug, chapter, verse, { modernPunctuation: true });
    const pieces = [];
    if (issue.referenceText) pieces.push(issue.referenceText);
    if (cuv) pieces.push(`CNBible CUV: ${cuv}`);
    if (cuvmp) pieces.push(`CNBible CUVMP: ${cuvmp}`);
    return { ...issue, referenceText: pieces.join(' / ') };
  });
}

function rankIssue(issue) {
  const confidenceRank = { '高': 0, '中': 1, '低': 2 };
  const categoryRank = {
    '確認錯字': 0,
    '高度疑似錯字': 1,
    '標點差異': 2,
    '註記格式差異': 3,
    '待人工確認': 4,
    '字形政策差異': 5,
    '章節結構差異': 6,
  };
  return (confidenceRank[issue.confidence] ?? 9) * 100 + (categoryRank[issue.category] ?? 50);
}

function markdownTable(rows, columns) {
  const header = `| ${columns.map(column => column.label).join(' | ')} |`;
  const separator = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows.map(row => `| ${columns.map(column => String(column.value(row) ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`);
  return [header, separator, ...body].join('\n');
}

function buildSummary(issues, bookAudits, policySummary, lowFrequencyRows, comparisonSummary) {
  const countWhere = predicate => issues.filter(predicate).length;
  return {
    generatedAt: new Date().toISOString(),
    repoPath: REPO_PATH,
    bibleEpubPath: BIBLE_EPUB_PATH,
    bookCount: bookAudits.length,
    oldTestamentBookCount: bookAudits.filter(book => book.testament === 'OT').length,
    newTestamentBookCount: bookAudits.filter(book => book.testament === 'NT').length,
    totalVerses: bookAudits.reduce((sum, book) => sum + book.verseCount, 0),
    suspectedIssueCount: issues.length,
    highConfidenceCount: countWhere(issue => issue.confidence === '高'),
    mediumConfidenceCount: countWhere(issue => issue.confidence === '中'),
    lowConfidenceCount: countWhere(issue => issue.confidence === '低'),
    recommendedFixCount: countWhere(issue => issue.recommendation === '建議修正'),
    recommendedKeepCount: countWhere(issue => issue.recommendation === '建議保留'),
    humanConfirmationCount: countWhere(issue => issue.recommendation === '待人工確認'),
    separatePolicyCount: countWhere(issue => issue.recommendation === '另案處理'),
    policyIssueCount: countWhere(issue => issue.category === '字形政策差異'),
    annotationIssueCount: countWhere(issue => issue.category === '註記格式差異'),
    punctuationIssueCount: countWhere(issue => issue.category === '標點差異'),
    structureIssueCount: countWhere(issue => issue.category === '章節結構差異'),
    lowFrequencyIssueCount: countWhere(issue => issue.suspect.startsWith('低頻字')),
    policySummary,
    lowFrequencyTop30: lowFrequencyRows.slice(0, 30),
    comparisonSummary,
  };
}

function renderReport({ summary, metadata, bookAudits, issues }) {
  const issueColumns = [
    { label: '編號', value: row => row.index },
    { label: '書卷', value: row => row.book },
    { label: '經文位置', value: row => row.reference },
    { label: '內建文字片段', value: row => excerpt(row.localText, 48) },
    { label: '對照來源文字片段', value: row => excerpt(row.referenceText, 58) },
    { label: '疑點', value: row => row.suspect },
    { label: '分類', value: row => row.category },
    { label: '建議處理', value: row => row.recommendation },
    { label: '信心', value: row => row.confidence },
    { label: '理由', value: row => excerpt(row.reason, 60) },
  ];
  const topIssues = issues.slice().sort((a, b) => rankIssue(a) - rankIssue(b) || a.index - b.index).slice(0, 30);
  const bookStats = bookAudits.map(book => ({
    group: book.group,
    book: book.name,
    entry: book.entryPath,
    chapters: book.chapterCount,
    verses: book.verseCount,
    empty: book.emptyVerses.length,
    duplicates: book.duplicateKeys.length,
    issues: issues.filter(issue => issue.book === book.name).length,
  }));
  const byBookTable = markdownTable(bookStats, [
    { label: '分區', value: row => row.group },
    { label: '書卷', value: row => row.book },
    { label: 'Entry', value: row => row.entry },
    { label: '章數', value: row => row.chapters },
    { label: '節數', value: row => row.verses },
    { label: '空節', value: row => row.empty },
    { label: '重複節', value: row => row.duplicates },
    { label: '疑點數', value: row => row.issues },
  ]);
  const policyTable = markdownTable(summary.policySummary, [
    { label: '字形項目', value: row => row.item },
    { label: '出現次數', value: row => row.count },
    { label: '代表位置', value: row => row.references.join('、') || '-' },
    { label: '建議', value: row => row.decision },
  ]);
  const lowFrequencyTable = markdownTable(summary.lowFrequencyTop30, [
    { label: '字', value: row => row.char },
    { label: '全本次數', value: row => row.count },
    { label: '代表位置', value: row => row.example.reference },
    { label: '內建文字片段', value: row => excerpt(row.example.text, 60) },
  ]);
  const comparisonTable = markdownTable(Object.entries(summary.comparisonSummary).map(([category, count]) => ({ category, count })), [
    { label: '逐節比對分類', value: row => row.category },
    { label: '節數', value: row => row.count },
  ]);
  const sections = GROUP_ORDER.map(group => {
    const groupIssues = issues.filter(issue => issue.group === group);
    return `### ${group}\n\n${groupIssues.length ? markdownTable(groupIssues.slice(0, 80), issueColumns) : '本區未列出疑似錯別字或需處理疑點。'}`;
  }).join('\n\n');
  const listByCategory = category => issues.filter(issue => issue.category === category);
  const listByRecommendation = recommendation => issues.filter(issue => issue.recommendation === recommendation);

  return `# 內建聖經整本完整文字盤點報告

## 基本資訊

- 盤點日期：${AUDIT_DATE.slice(0, 4)}-${AUDIT_DATE.slice(4, 6)}-${AUDIT_DATE.slice(6, 8)}
- Repo path：${summary.repoPath}
- 內建聖經來源：${summary.bibleEpubPath}
- 檢查範圍：整本聖經 66 卷。
- 本輪為只讀盤點；未修改 \`assets/default-books/bible.epub\`、經文、版本號、前端程式、資料庫或正式資料。

## EPUB Metadata

- Title：${metadata.title}
- Identifier：${metadata.identifier}
- Language：${metadata.language}
- Creator：${metadata.creator}
- Modified：${metadata.modified}

## 經文抓取來源確認

- \`app.js\` 的 \`DEFAULT_BIBLE_EPUB_PATH\` 指向 \`/assets/default-books/bible.epub?v=...\`。
- \`loadScriptureBibleEntries()\` 下載此 EPUB 並解壓。
- \`fetchScriptureReference()\` 依書卷 code 讀取 \`OEBPS/text/{BOOK}.xhtml\`，因此抓取結果直接反映本 EPUB。

## 對照來源

- eBible cmn-cu89t USFM：${EBIBLE_USFM_URL}。本輪用於全本逐節自動比對。
- Wikisource 聖經和合本：${WIKISOURCE_BASE_URL}。本輪嘗試逐卷抓取並抽節比對。
- CNBible CUV / CUVMP：${CNBIBLE_BASE_URL}。本輪用於排序後前 ${CNBIBLE_SNIPPET_LIMIT} 個疑點候選節的章頁交叉佐證，不以單一來源判定錯字。

## 檢查方法

1. 解析 EPUB metadata、spine 與 66 卷 XHTML entry。
2. 抽出內建 EPUB 逐卷、逐章、逐節文字。
3. 解析 eBible cmn-cu89t USFM，做全本逐節比對與分類摘要。
4. 抓取 Wikisource 66 卷頁面，抽取同章節節號做第二來源比對。
5. 對疑點候選節抓取 CNBible CUV / CUVMP 章頁作佐證。
6. 掃描低頻字、罕見字、形近字、疑似轉檔字、註記格式、標點括號、章節結構差異。
7. 本輪不把已知錯字清單當掃描邊界；已知字只作為少數風險信號之一。

## 66 卷完整性

- 書卷數：${summary.bookCount}
- 舊約：${summary.oldTestamentBookCount} 卷
- 新約：${summary.newTestamentBookCount} 卷
- 內建總節數：${summary.totalVerses}
- 空節：${bookAudits.reduce((sum, book) => sum + book.emptyVerses.length, 0)}
- 重複節：${bookAudits.reduce((sum, book) => sum + book.duplicateKeys.length, 0)}

${byBookTable}

## 逐節比對摘要

${comparisonTable}

## 疑點統計

- 疑點總數：${summary.suspectedIssueCount}
- 高信心：${summary.highConfidenceCount}
- 中信心：${summary.mediumConfidenceCount}
- 低信心：${summary.lowConfidenceCount}
- 建議修正：${summary.recommendedFixCount}
- 建議保留：${summary.recommendedKeepCount}
- 待人工確認：${summary.humanConfirmationCount}
- 另案處理：${summary.separatePolicyCount}
- 字形政策項目：${summary.policyIssueCount}
- 註記格式項目：${summary.annotationIssueCount}
- 標點問題：${summary.punctuationIssueCount}
- 章節結構差異：${summary.structureIssueCount}
- 低頻可疑字項目：${summary.lowFrequencyIssueCount}

## 最嚴重前 30 筆疑點

${topIssues.length ? markdownTable(topIssues, issueColumns) : '本輪未列出高優先疑點。'}

## 疑似錯別字總表

${issues.length ? markdownTable(issues, issueColumns) : '本輪未列出疑似錯別字。'}

## 分卷疑點清單

${sections}

## 字形政策清單

${policyTable}

## 註記格式清單

${listByCategory('註記格式差異').length ? markdownTable(listByCategory('註記格式差異'), issueColumns) : '本輪未列出註記格式疑點。'}

## 標點問題清單

${listByCategory('標點差異').length ? markdownTable(listByCategory('標點差異'), issueColumns) : '本輪未列出標點問題。'}

## 章節結構差異清單

${listByCategory('章節結構差異').length ? markdownTable(listByCategory('章節結構差異'), issueColumns) : '本輪未列出章節結構差異。'}

## 低頻可疑字前 30 筆

${lowFrequencyTable}

## 建議修正清單

${listByRecommendation('建議修正').length ? markdownTable(listByRecommendation('建議修正'), issueColumns) : '本輪沒有直接建議修正項目；需先由使用者確認疑點。'}

## 建議保留清單

${listByRecommendation('建議保留').length ? markdownTable(listByRecommendation('建議保留'), issueColumns) : '本輪沒有新增明確建議保留的文字疑點。'}

## 待人工確認清單

${listByRecommendation('待人工確認').length ? markdownTable(listByRecommendation('待人工確認'), issueColumns) : '本輪沒有待人工確認項目。'}

## 本輪未修改 bible.epub 聲明

本輪只新增 / 更新只讀 audit script 與盤點報告，未修改 \`assets/default-books/bible.epub\`，未修改內建經文，未修改版本號，未修改正式資料。

## 下一階段修正建議

### 第一階段：高信心確認錯字

- 只修多來源一致、語意明顯不通或轉檔錯字。
- 每筆修正前保留對照來源與原文片段。

### 第二階段：中信心項目逐條比對

- 來源一致者才修正。
- 來源不一致、涉及版本或傳統用字者列待確認。

### 第三階段：字形政策項目

- 由使用者決定採現代常用字或保留和合本傳統字形。
- 不應把所有異體字批次現代化。

### 第四階段：註記格式與標點問題

- 只處理影響閱讀或註記黏連正文的項目。
- 純標點差異不急修。

### 第五階段：章節結構差異另案處理

- 章節結構會影響引用、抓取、閱讀與既有札記，必須另案規劃。
`;
}

function main() {
  if (!existsSync(BIBLE_EPUB_PATH)) throw new Error(`${BIBLE_EPUB_PATH} not found`);
  ensureReferenceZip();
  const opf = run('unzip', ['-p', BIBLE_EPUB_PATH, 'OEBPS/content.opf']);
  const metadata = parseOpfMetadata(opf);
  const opfEntries = parseOpfEntries(opf);
  const usfmFiles = run('unzip', ['-Z1', EBIBLE_ZIP_PATH]).split('\n').map(value => value.trim()).filter(Boolean);
  const bookAudits = BOOKS.map(book => buildBookAudit(book, opfEntries, usfmFiles));
  const charFrequencyRows = countHanChars(bookAudits);

  const { issues: policyIssues, policySummary } = scanPolicyIssues(bookAudits);
  const textQualityIssues = scanTextQualityIssues(bookAudits);
  const lowFrequencyIssues = scanLowFrequencyIssues(bookAudits, charFrequencyRows);
  const { issues: crossSourceIssues, comparisonSummary } = scanCrossSourceIssues(bookAudits);
  const structureIssues = buildStructureIssues();
  let issues = [
    ...textQualityIssues,
    ...policyIssues,
    ...crossSourceIssues,
    ...lowFrequencyIssues,
    ...structureIssues,
  ];
  issues = attachCnbibleSnippets(issues)
    .map((issue, index) => ({ ...issue, index: index + 1 }));

  const summary = buildSummary(issues, bookAudits, policySummary, charFrequencyRows, comparisonSummary);
  const report = {
    summary,
    metadata,
    bookStats: bookAudits.map(book => ({
      code: book.code,
      name: book.name,
      group: book.group,
      testament: book.testament,
      entryPath: book.entryPath,
      chapterCount: book.chapterCount,
      verseCount: book.verseCount,
      opfListed: book.opfListed,
      emptyVerses: book.emptyVerses,
      duplicateKeys: book.duplicateKeys,
    })),
    issues,
    lowFrequencyRows: charFrequencyRows.slice(0, 120),
  };

  writeFileSync(JSON_REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(MARKDOWN_REPORT_PATH, renderReport({ summary, metadata, bookAudits, issues }));

  console.log('Comprehensive Bible text suspects audit completed');
  console.log(`Markdown report: ${MARKDOWN_REPORT_PATH}`);
  console.log(`JSON report: ${JSON_REPORT_PATH}`);
  console.log(`Books: ${summary.bookCount} (${summary.oldTestamentBookCount} OT / ${summary.newTestamentBookCount} NT)`);
  console.log(`Verses: ${summary.totalVerses}`);
  console.log(`Suspected issues: ${summary.suspectedIssueCount} (high ${summary.highConfidenceCount}, medium ${summary.mediumConfidenceCount}, low ${summary.lowConfidenceCount})`);
  console.log(`Recommendations: fix ${summary.recommendedFixCount}, keep ${summary.recommendedKeepCount}, confirm ${summary.humanConfirmationCount}, separate ${summary.separatePolicyCount}`);
  console.log(`Categories: policy ${summary.policyIssueCount}, annotations ${summary.annotationIssueCount}, punctuation ${summary.punctuationIssueCount}, structure ${summary.structureIssueCount}, low-frequency ${summary.lowFrequencyIssueCount}`);
}

main();
