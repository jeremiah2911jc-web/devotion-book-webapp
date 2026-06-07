import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const AUDIT_DATE = process.env.AUDIT_DATE || '20260607';
const REPO_PATH = process.cwd();
const BIBLE_EPUB_PATH = 'assets/default-books/bible.epub';
const EBIBLE_USFM_URL = 'https://ebible.org/Scriptures/cmn-cu89t_usfm.zip';
const ARTIFACTS_DIR = process.env.AUDIT_ARTIFACTS_DIR || path.join(REPO_PATH, 'artifacts');
const CACHE_DIR = path.join(ARTIFACTS_DIR, 'bible-text-audit-cache');
const EBIBLE_ZIP_PATH = path.join(CACHE_DIR, 'cmn-cu89t_usfm.zip');
const JSON_REPORT_PATH = path.join(ARTIFACTS_DIR, `bible-chapter-structure-audit-${AUDIT_DATE}.json`);
const MARKDOWN_REPORT_PATH = path.join(ARTIFACTS_DIR, `bible-chapter-structure-audit-${AUDIT_DATE}.md`);

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

const STRUCTURE_EVENTS = [
  { code: 'MAT', chapter: 18, verse: 11, cnbibleSlug: 'matthew', wikiPath: '馬太福音', localStatus: '獨立小字節', primaryType: '註記 / 小字差異', decision: '不建議修正', note: 'eBible / CUVMP 放在 18:10 註腳；Wikisource 與 CNBible CUV 保留獨立 18:11。' },
  { code: 'MAT', chapter: 23, verse: 14, cnbibleSlug: 'matthew', wikiPath: '馬太福音', localStatus: '獨立小字節', primaryType: '註記 / 小字差異', decision: '不建議修正', note: 'eBible / CUVMP 放在 23:13 註腳；Wikisource 與 CNBible CUV 保留獨立 23:14。' },
  { code: 'MRK', chapter: 7, verse: 16, cnbibleSlug: 'mark', wikiPath: '馬可福音', localStatus: '獨立小字節', primaryType: '註記 / 小字差異', decision: '不建議修正', note: 'eBible / CUVMP 放在 7:15 註腳；Wikisource 與 CNBible CUV 保留獨立 7:16。' },
  { code: 'MRK', chapter: 15, verse: 28, cnbibleSlug: 'mark', wikiPath: '馬可福音', localStatus: '獨立註記節', primaryType: '註記 / 小字差異', decision: '不建議修正', note: 'eBible / CUVMP 放在 15:27 註腳；Wikisource 與 CNBible CUV 保留獨立 15:28。' },
  { code: 'LUK', chapter: 17, verse: 36, cnbibleSlug: 'luke', wikiPath: '路加福音', localStatus: '獨立小字節', primaryType: '註記 / 小字差異', decision: '不建議修正', note: 'eBible / CUVMP 放在 17:35 註腳；Wikisource 與 CNBible CUV 保留獨立 17:36。' },
  { code: 'LUK', chapter: 23, verse: 17, cnbibleSlug: 'luke', wikiPath: '路加福音', localStatus: '獨立小字節', primaryType: '註記 / 小字差異', decision: '不建議修正', note: 'eBible / CUVMP 放在 23:16 註腳；Wikisource 與 CNBible CUV 保留獨立 23:17。' },
  { code: 'JHN', chapter: 5, verse: 4, cnbibleSlug: 'john', wikiPath: '約翰福音', localStatus: '獨立小字節', primaryType: '註記 / 小字差異', decision: '不建議修正', note: 'eBible / CUVMP 放在 5:3 註腳；Wikisource 與 CNBible CUV 保留獨立 5:4。' },
  { code: 'JHN', chapter: 7, verse: 53, cnbibleSlug: 'john', wikiPath: '約翰福音', localStatus: '獨立節', primaryType: '來源分節差異', decision: '不建議修正', note: '內建 EPUB 與 CNBible CUV 把「於是各人都回家去了」列為 7:53；eBible / Wikisource / CUVMP 併入 8:1。' },
  { code: 'ACT', chapter: 8, verse: 37, cnbibleSlug: 'acts', wikiPath: '使徒行傳', localStatus: '獨立小字節', primaryType: '註記 / 小字差異', decision: '不建議修正', note: 'eBible / CUVMP 放在 8:36 註腳；Wikisource 與 CNBible CUV 保留獨立 8:37。' },
  { code: 'ACT', chapter: 15, verse: 34, cnbibleSlug: 'acts', wikiPath: '使徒行傳', localStatus: '獨立小字節', primaryType: '註記 / 小字差異', decision: '不建議修正', note: 'eBible / CUVMP 放在 15:33 註腳；Wikisource 與 CNBible CUV 保留獨立 15:34。' },
  { code: 'ACT', chapter: 24, verse: 7, cnbibleSlug: 'acts', wikiPath: '使徒行傳', localStatus: '獨立小字節', primaryType: '註記 / 小字差異', decision: '不建議修正', note: 'eBible / CUVMP 放在 24:6 註腳；Wikisource 與 CNBible CUV 保留獨立 24:7。' },
  { code: 'ACT', chapter: 28, verse: 29, cnbibleSlug: 'acts', wikiPath: '使徒行傳', localStatus: '獨立小字節', primaryType: '註記 / 小字差異', decision: '不建議修正', note: 'eBible / CUVMP 放在 28:28 註腳；Wikisource 與 CNBible CUV 保留獨立 28:29。' },
  { code: 'REV', chapter: 12, verse: 18, cnbibleSlug: 'revelation', wikiPath: '啟示錄', localStatus: '併入 12:17', primaryType: '來源分節差異', decision: '不建議修正', note: 'eBible 把「那時龍就站在海邊的沙上」列為 12:18；內建 EPUB、Wikisource、CNBible CUV/CUVMP 均併入 12:17。' },
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

function curl(url) {
  return run('curl', ['-fsSL', url], { maxBuffer: 30 * 1024 * 1024 });
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
    verses.push({ chapter, verse, key, text: stripTags(match[3]) });
  }
  return { verses, duplicateKeys };
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

function expandVerseToken(token = '') {
  const match = String(token || '').match(/^(\d+)(?:-(\d+))?$/);
  if (!match) return [];
  const start = Number(match[1]);
  const end = Number(match[2] || match[1]);
  const verses = [];
  for (let verse = start; verse <= end; verse += 1) verses.push(verse);
  return verses;
}

function parseUsfmStatus(usfm = '', chapter, verse) {
  let activeChapter = 0;
  for (const rawLine of String(usfm || '').replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trim();
    const chapterMatch = line.match(/^\\c\s+(\d+)/);
    if (chapterMatch) {
      activeChapter = Number(chapterMatch[1]);
      continue;
    }
    if (activeChapter !== chapter) continue;
    const verseMatch = line.match(/^\\v\s+([0-9-]+)/);
    if (!verseMatch) continue;
    if (expandVerseToken(verseMatch[1]).includes(verse)) return '獨立節';
    if (line.includes(`\\fv ${verse}`) || line.includes(`\\fv \\ft ${verse}`) || line.includes(`\\ft ${verse} `)) {
      return `前節註腳 ${chapter}:${verseMatch[1]}`;
    }
  }
  return '缺少/併入他處';
}

function getUsfmFileForBook(files, code) {
  return files.find(file => new RegExp(`-${code}cmn-cu89t\\.usfm$`).test(file)) || '';
}

function getWikisourceStatus(html = '', event) {
  const marker = `id="${event.chapter}:${event.verse}"`;
  if (html.includes(marker)) {
    const fragment = html.slice(html.indexOf(marker), html.indexOf(marker) + 600);
    return fragment.includes('<small') ? '獨立節（小字）' : '獨立節';
  }
  if (event.code === 'JHN' && event.chapter === 7 && event.verse === 53 && html.includes('id="8:1"') && html.includes('於是各人都回家去了')) {
    return '併入 8:1';
  }
  if (event.code === 'REV' && event.chapter === 12 && event.verse === 18 && html.includes('id="12:17"') && html.includes('那時龍就站在海邊的沙上')) {
    return '併入 12:17';
  }
  return '缺少/非獨立節';
}

function getCnbibleStatus(html = '', event, { modernPunctuation = false } = {}) {
  const href = `/${event.cnbibleSlug}/${event.chapter}-${event.verse}.htm`;
  if (html.includes(href)) {
    if (modernPunctuation && html.includes(`>${event.verse}&#8239;</a>`)) return '獨立節';
    if (!modernPunctuation && new RegExp(`<b>${event.verse}<\\/b>`).test(html)) return '獨立節';
  }
  if (event.code === 'JHN' && event.chapter === 7 && event.verse === 53 && html.includes(`/${event.cnbibleSlug}/8-1.htm`) && html.includes('於是各人都回家去了')) {
    return '併入 8:1';
  }
  if (event.code === 'REV' && event.chapter === 12 && event.verse === 18) {
    if (html.includes('那 時 龍 就 站 在 海 邊 的 沙 上') || html.includes('那時龍就站在海邊的沙上')) return '併入 12:17';
  }
  if (html.includes('有古卷') && (html.includes(`：${event.verse}`) || html.includes(`${event.verse}`))) return '前節註腳';
  return '缺少/非正文節';
}

function markdownTable(rows, columns) {
  const header = `| ${columns.map(column => column.label).join(' | ')} |`;
  const separator = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows.map(row => `| ${columns.map(column => String(column.value(row) ?? '').replace(/\|/g, '\\|')).join(' | ')} |`);
  return [header, separator, ...body].join('\n');
}

function buildIntegrityStats(opfEntries) {
  return BOOKS.map(book => {
    const xhtml = run('unzip', ['-p', BIBLE_EPUB_PATH, book.entryPath]);
    const { verses, duplicateKeys } = extractEpubVerses(xhtml);
    const chapters = summarizeChapters(verses);
    return {
      code: book.code,
      name: book.name,
      testament: book.testament,
      entryPath: book.entryPath,
      opfListed: opfEntries.includes(book.entryPath),
      chapterCount: chapters.length,
      verseCount: verses.length,
      duplicateKeys,
      emptyVerses: verses.filter(verse => !verse.text.trim()).map(verse => verse.key),
      chaptersWithMissingVerses: chapters.filter(chapter => chapter.missingVerses.length),
      chaptersWithDuplicateVerses: chapters.filter(chapter => chapter.duplicateVerses.length),
    };
  });
}

function buildStructureRows(events, bookByCode, localStats) {
  const rows = [];
  let index = 1;
  for (const event of events) {
    const book = bookByCode.get(event.code);
    const stat = localStats.find(item => item.code === event.code);
    const chapter = stat.chapters?.find(item => item.chapter === event.chapter);
    const localVerseCount = chapter?.verseCount || 0;
    const eBibleVerseCount = event.eBibleChapterVerseCount || 0;
    const verseRef = `${book.name} ${event.chapter}:${event.verse}`;
    const chapterRef = `${book.name} ${event.chapter}`;
    rows.push({
      index: index++,
      book: book.name,
      location: verseRef,
      localStatus: event.localStatus,
      eBibleStatus: event.eBibleStatus,
      wikisourceStatus: event.wikisourceStatus,
      cnbibleStatus: `${event.cnbibleCuvStatus} / ${event.cnbibleCuvmpStatus}`,
      type: event.primaryType,
      decision: event.decision,
      reason: event.note,
    });
    rows.push({
      index: index++,
      book: book.name,
      location: chapterRef,
      localStatus: `章節數差異：內建 ${localVerseCount} / eBible ${eBibleVerseCount}`,
      eBibleStatus: `第 ${event.chapter} 章節數 ${eBibleVerseCount}`,
      wikisourceStatus: event.wikisourceStatus,
      cnbibleStatus: `${event.cnbibleCuvStatus} / ${event.cnbibleCuvmpStatus}`,
      type: event.primaryType,
      decision: event.decision,
      reason: `由 ${verseRef} 的節號政策造成；不是另一起獨立錯誤。`,
    });
  }
  return rows;
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    acc[row[key]] = (acc[row[key]] || 0) + 1;
    return acc;
  }, {});
}

function renderMarkdown(report) {
  const rowsTable = markdownTable(report.structureRows, [
    { label: '編號', value: row => row.index },
    { label: '書卷', value: row => row.book },
    { label: '章節', value: row => row.location },
    { label: '內建 EPUB 狀態', value: row => row.localStatus },
    { label: 'eBible 狀態', value: row => row.eBibleStatus },
    { label: 'Wikisource 狀態', value: row => row.wikisourceStatus },
    { label: 'CNBible CUV / CUVMP 狀態', value: row => row.cnbibleStatus },
    { label: '差異類型', value: row => row.type },
    { label: '初步判斷', value: row => row.decision },
  ]);
  const integrityTable = markdownTable(report.integrityStats, [
    { label: '書卷', value: row => row.name },
    { label: '約別', value: row => row.testament === 'OT' ? '舊約' : '新約' },
    { label: 'Entry', value: row => row.entryPath },
    { label: '章數', value: row => row.chapterCount },
    { label: '節數', value: row => row.verseCount },
    { label: '空節', value: row => row.emptyVerses.length },
    { label: '重複節', value: row => row.duplicateKeys.length },
    { label: '跳號章', value: row => row.chaptersWithMissingVerses.length },
  ]);
  return `# 內建聖經章節結構差異只讀查驗

## 摘要

- 盤點日期：${AUDIT_DATE.slice(0, 4)}-${AUDIT_DATE.slice(4, 6)}-${AUDIT_DATE.slice(6, 8)}
- Repo path：${report.repoPath}
- 內建聖經來源：${report.bibleEpubPath}
- 書卷數：${report.bookCount}（舊約 ${report.oldTestamentBookCount} / 新約 ${report.newTestamentBookCount}）
- 結構差異列數：${report.structureRows.length}
- 明確結構錯誤：${report.summary.explicitStructureErrors}
- 來源分節差異：${report.summary.sourceVersificationDifferences}
- 和合本版本差異：${report.summary.cuvVersionDifferences}
- 註記 / 小字差異：${report.summary.noteOrSmallTextDifferences}
- 不建議修正：${report.summary.notRecommended}
- 待人工確認：${report.summary.needsHumanConfirmation}
- 本腳本只讀；未修改 \`assets/default-books/bible.epub\`。

## 26 筆節號差異總表

${rowsTable}

## 66 卷章節完整性統計

${integrityTable}
`;
}

function main() {
  if (!existsSync(BIBLE_EPUB_PATH)) throw new Error(`${BIBLE_EPUB_PATH} not found`);
  ensureReferenceZip();

  const opf = run('unzip', ['-p', BIBLE_EPUB_PATH, 'OEBPS/content.opf']);
  const opfEntries = parseOpfEntries(opf);
  const usfmFiles = run('unzip', ['-Z1', EBIBLE_ZIP_PATH]).split('\n').map(value => value.trim()).filter(Boolean);
  const localStats = buildIntegrityStats(opfEntries).map(stat => ({
    ...stat,
    chapters: summarizeChapters(extractEpubVerses(run('unzip', ['-p', BIBLE_EPUB_PATH, stat.entryPath])).verses),
  }));
  const bookByCode = new Map(BOOKS.map(book => [book.code, book]));

  const sourceCache = new Map();
  const getSource = url => {
    if (!sourceCache.has(url)) sourceCache.set(url, curl(url));
    return sourceCache.get(url);
  };

  const enrichedEvents = STRUCTURE_EVENTS.map(event => {
    const usfmFile = getUsfmFileForBook(usfmFiles, event.code);
    const usfm = usfmFile ? run('unzip', ['-p', EBIBLE_ZIP_PATH, usfmFile]) : '';
    const eBibleChapterVerseCount = String(usfm || '')
      .replace(/\r\n/g, '\n')
      .split('\n')
      .reduce((state, line) => {
        const chapterMatch = line.match(/^\\c\s+(\d+)/);
        if (chapterMatch) state.chapter = Number(chapterMatch[1]);
        const verseMatch = line.match(/^\\v\s+([0-9-]+)/);
        if (state.chapter === event.chapter && verseMatch) state.count += expandVerseToken(verseMatch[1]).length;
        return state;
      }, { chapter: 0, count: 0 }).count;
    const wikiHtml = getSource(`https://zh.wikisource.org/wiki/%E8%81%96%E7%B6%93_(%E5%92%8C%E5%90%88%E6%9C%AC)/${encodeURIComponent(event.wikiPath)}`);
    const cnbibleCuvHtml = getSource(`https://cnbible.com/cu/${event.cnbibleSlug}/${event.chapter}.htm`);
    const cnbibleCuvmpCurrentHtml = getSource(`https://cnbible.com/cuvmpt/${event.cnbibleSlug}/${event.chapter}.htm`);
    const cnbibleCuvmpHtml = event.code === 'JHN' && event.chapter === 7 && event.verse === 53
      ? `${cnbibleCuvmpCurrentHtml}\n${getSource(`https://cnbible.com/cuvmpt/${event.cnbibleSlug}/8.htm`)}`
      : cnbibleCuvmpCurrentHtml;
    const eBibleStatus = event.code === 'JHN' && event.chapter === 7 && event.verse === 53 && usfm.includes('\\v 1 於是各人都回家去了')
      ? '併入 8:1'
      : parseUsfmStatus(usfm, event.chapter, event.verse);
    return {
      ...event,
      eBibleStatus,
      eBibleChapterVerseCount,
      wikisourceStatus: getWikisourceStatus(wikiHtml, event),
      cnbibleCuvStatus: getCnbibleStatus(cnbibleCuvHtml, event),
      cnbibleCuvmpStatus: getCnbibleStatus(cnbibleCuvmpHtml, event, { modernPunctuation: true }),
    };
  });

  const structureRows = buildStructureRows(enrichedEvents, bookByCode, localStats);
  const typeCounts = countBy(structureRows, 'type');
  const decisionCounts = countBy(structureRows, 'decision');
  const explicitStructureErrors = typeCounts['明確結構錯誤'] || 0;
  const report = {
    generatedAt: new Date().toISOString(),
    repoPath: REPO_PATH,
    bibleEpubPath: BIBLE_EPUB_PATH,
    bookCount: localStats.length,
    oldTestamentBookCount: localStats.filter(book => book.testament === 'OT').length,
    newTestamentBookCount: localStats.filter(book => book.testament === 'NT').length,
    integrityStats: localStats,
    structureEvents: enrichedEvents,
    structureRows,
    summary: {
      explicitStructureErrors,
      sourceVersificationDifferences: typeCounts['來源分節差異'] || 0,
      cuvVersionDifferences: typeCounts['和合本版本差異'] || 0,
      noteOrSmallTextDifferences: typeCounts['註記 / 小字差異'] || 0,
      notRecommended: decisionCounts['不建議修正'] || 0,
      needsHumanConfirmation: decisionCounts['待人工確認'] || 0,
      typeCounts,
      decisionCounts,
      emptyVerseCount: localStats.reduce((sum, book) => sum + book.emptyVerses.length, 0),
      duplicateVerseCount: localStats.reduce((sum, book) => sum + book.duplicateKeys.length, 0),
      chaptersWithMissingVerses: localStats.reduce((sum, book) => sum + book.chaptersWithMissingVerses.length, 0),
    },
  };

  writeFileSync(JSON_REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(MARKDOWN_REPORT_PATH, renderMarkdown(report));

  console.log('Bible chapter structure audit completed');
  console.log(`JSON report: ${JSON_REPORT_PATH}`);
  console.log(`Markdown report: ${MARKDOWN_REPORT_PATH}`);
  console.log(`Books: ${report.bookCount} (${report.oldTestamentBookCount} OT / ${report.newTestamentBookCount} NT)`);
  console.log(`Structure rows: ${structureRows.length}`);
  console.log(`Explicit structure errors: ${report.summary.explicitStructureErrors}`);
  console.log(`Source versification differences: ${report.summary.sourceVersificationDifferences}`);
  console.log(`Note/small-text differences: ${report.summary.noteOrSmallTextDifferences}`);
  console.log(`Not recommended: ${report.summary.notRecommended}`);
  console.log(`Needs human confirmation: ${report.summary.needsHumanConfirmation}`);
}

main();
