const SCRIPTURE_BOOKS = Object.freeze([
  { code: 'GEN', canonical: '創世記', english: 'Genesis', chapters: 50, aliases: ['創', '創世記', 'Genesis', 'Gen'] },
  { code: 'EXO', canonical: '出埃及記', english: 'Exodus', chapters: 40, aliases: ['出', '出埃及記', 'Exodus', 'Exod', 'Exo'] },
  { code: 'LEV', canonical: '利未記', english: 'Leviticus', chapters: 27, aliases: ['利未記', '利', 'Leviticus', 'Lev'] },
  { code: 'NUM', canonical: '民數記', english: 'Numbers', chapters: 36, aliases: ['民數記', '民', 'Numbers', 'Num'] },
  { code: 'DEU', canonical: '申命記', english: 'Deuteronomy', chapters: 34, aliases: ['申命記', '申', 'Deuteronomy', 'Deut', 'Deu'] },
  { code: 'JOS', canonical: '約書亞記', english: 'Joshua', chapters: 24, aliases: ['約書亞記', '約書亞', 'Joshua', 'Josh', 'Jos'] },
  { code: 'JDG', canonical: '士師記', english: 'Judges', chapters: 21, aliases: ['士師記', '士', 'Judges', 'Judg', 'Jdg'] },
  { code: 'RUT', canonical: '路得記', english: 'Ruth', chapters: 4, aliases: ['路得記', '路得', 'Ruth', 'Rut'] },
  { code: '1SA', canonical: '撒母耳記上', english: '1 Samuel', chapters: 31, aliases: ['撒上', '撒母耳記上', '撒母耳上', '1 Samuel', '1Samuel', '1 Sam', '1Sam'] },
  { code: '2SA', canonical: '撒母耳記下', english: '2 Samuel', chapters: 24, aliases: ['撒下', '撒母耳記下', '撒母耳下', '2 Samuel', '2Samuel', '2 Sam', '2Sam'] },
  { code: '1KI', canonical: '列王紀上', english: '1 Kings', chapters: 22, aliases: ['王上', '列王紀上', '列王記上', '1 Kings', '1Kings', '1 Kgs', '1Kgs'] },
  { code: '2KI', canonical: '列王紀下', english: '2 Kings', chapters: 25, aliases: ['王下', '列王紀下', '列王記下', '2 Kings', '2Kings', '2 Kgs', '2Kgs'] },
  { code: '1CH', canonical: '歷代志上', english: '1 Chronicles', chapters: 29, aliases: ['代上', '歷代志上', '1 Chronicles', '1Chronicles', '1 Chron', '1Chron'] },
  { code: '2CH', canonical: '歷代志下', english: '2 Chronicles', chapters: 36, aliases: ['代下', '歷代志下', '2 Chronicles', '2Chronicles', '2 Chron', '2Chron'] },
  { code: 'EZR', canonical: '以斯拉記', english: 'Ezra', chapters: 10, aliases: ['以斯拉記', '以斯拉', 'Ezra', 'Ezr'] },
  { code: 'NEH', canonical: '尼希米記', english: 'Nehemiah', chapters: 13, aliases: ['尼希米記', '尼希米', 'Nehemiah', 'Neh'] },
  { code: 'EST', canonical: '以斯帖記', english: 'Esther', chapters: 10, aliases: ['以斯帖記', '以斯帖', 'Esther', 'Est'] },
  { code: 'JOB', canonical: '約伯記', english: 'Job', chapters: 42, aliases: ['約伯記', '約伯', 'Job'] },
  { code: 'PSA', canonical: '詩篇', english: 'Psalms', chapters: 150, aliases: ['詩篇', '詩', 'Psalms', 'Psalm', 'Psa', 'Ps'] },
  { code: 'PRO', canonical: '箴言', english: 'Proverbs', chapters: 31, aliases: ['箴言', '箴', 'Proverbs', 'Prov', 'Pro'] },
  { code: 'ECC', canonical: '傳道書', english: 'Ecclesiastes', chapters: 12, aliases: ['傳道書', '傳', 'Ecclesiastes', 'Eccl', 'Ecc'] },
  { code: 'SNG', canonical: '雅歌', english: 'Song of Solomon', chapters: 8, aliases: ['雅歌', 'Song of Solomon', 'Song', 'Songs', 'Sng'] },
  { code: 'ISA', canonical: '以賽亞書', english: 'Isaiah', chapters: 66, aliases: ['以賽亞書', '以賽亞', '賽', 'Isaiah', 'Isa'] },
  { code: 'JER', canonical: '耶利米書', english: 'Jeremiah', chapters: 52, aliases: ['耶利米書', '耶利米', 'Jeremiah', 'Jer'] },
  { code: 'LAM', canonical: '耶利米哀歌', english: 'Lamentations', chapters: 5, aliases: ['耶利米哀歌', '哀', 'Lamentations', 'Lam'] },
  { code: 'EZK', canonical: '以西結書', english: 'Ezekiel', chapters: 48, aliases: ['以西結書', '以西結', 'Ezekiel', 'Ezek', 'Ezk'] },
  { code: 'DAN', canonical: '但以理書', english: 'Daniel', chapters: 12, aliases: ['但以理書', '但以理', 'Daniel', 'Dan'] },
  { code: 'HOS', canonical: '何西阿書', english: 'Hosea', chapters: 14, aliases: ['何西阿書', '何西阿', 'Hosea', 'Hos'] },
  { code: 'JOL', canonical: '約珥書', english: 'Joel', chapters: 3, aliases: ['約珥書', '約珥', 'Joel', 'Jol'] },
  { code: 'AMO', canonical: '阿摩司書', english: 'Amos', chapters: 9, aliases: ['阿摩司書', '阿摩司', 'Amos', 'Amo'] },
  { code: 'OBA', canonical: '俄巴底亞書', english: 'Obadiah', chapters: 1, aliases: ['俄巴底亞書', '俄巴底亞', 'Obadiah', 'Obad', 'Oba'] },
  { code: 'JON', canonical: '約拿書', english: 'Jonah', chapters: 4, aliases: ['約拿書', '約拿', 'Jonah', 'Jon'] },
  { code: 'MIC', canonical: '彌迦書', english: 'Micah', chapters: 7, aliases: ['彌迦書', '彌迦', 'Micah', 'Mic'] },
  { code: 'NAM', canonical: '那鴻書', english: 'Nahum', chapters: 3, aliases: ['那鴻書', '那鴻', 'Nahum', 'Nah', 'Nam'] },
  { code: 'HAB', canonical: '哈巴谷書', english: 'Habakkuk', chapters: 3, aliases: ['哈巴谷書', '哈巴谷', 'Habakkuk', 'Hab'] },
  { code: 'ZEP', canonical: '西番雅書', english: 'Zephaniah', chapters: 3, aliases: ['西番雅書', '西番雅', 'Zephaniah', 'Zeph', 'Zep'] },
  { code: 'HAG', canonical: '哈該書', english: 'Haggai', chapters: 2, aliases: ['哈該書', '哈該', 'Haggai', 'Hag'] },
  { code: 'ZEC', canonical: '撒迦利亞書', english: 'Zechariah', chapters: 14, aliases: ['撒迦利亞書', '撒迦利亞', '撒迦', 'Zechariah', 'Zech', 'Zec'] },
  { code: 'MAL', canonical: '瑪拉基書', english: 'Malachi', chapters: 4, aliases: ['瑪拉基書', '瑪拉基', 'Malachi', 'Mal'] },
  { code: 'MAT', canonical: '馬太福音', english: 'Matthew', chapters: 28, aliases: ['馬太福音', '馬太', '太', 'Matthew', 'Matt', 'Mat'] },
  { code: 'MRK', canonical: '馬可福音', english: 'Mark', chapters: 16, aliases: ['馬可福音', '馬可', '可', 'Mark', 'Mrk'] },
  { code: 'LUK', canonical: '路加福音', english: 'Luke', chapters: 24, aliases: ['路加福音', '路加', '路', 'Luke', 'Luk'] },
  { code: 'JHN', canonical: '約翰福音', english: 'John', chapters: 21, aliases: ['約翰福音', '約翰', '約', 'John', 'Jhn'] },
  { code: 'ACT', canonical: '使徒行傳', english: 'Acts', chapters: 28, aliases: ['使徒行傳', '使徒', '徒', 'Acts', 'Act'] },
  { code: 'ROM', canonical: '羅馬書', english: 'Romans', chapters: 16, aliases: ['羅馬書', '羅馬', '羅', 'Romans', 'Rom'] },
  { code: '1CO', canonical: '哥林多前書', english: '1 Corinthians', chapters: 16, aliases: ['哥林多前書', '林前', '1 Corinthians', '1Corinthians', '1 Cor', '1Cor'] },
  { code: '2CO', canonical: '哥林多後書', english: '2 Corinthians', chapters: 13, aliases: ['哥林多後書', '林後', '2 Corinthians', '2Corinthians', '2 Cor', '2Cor'] },
  { code: 'GAL', canonical: '加拉太書', english: 'Galatians', chapters: 6, aliases: ['加拉太書', '加拉太', 'Galatians', 'Gal'] },
  { code: 'EPH', canonical: '以弗所書', english: 'Ephesians', chapters: 6, aliases: ['以弗所書', '以弗所', 'Ephesians', 'Eph'] },
  { code: 'PHP', canonical: '腓立比書', english: 'Philippians', chapters: 4, aliases: ['腓立比書', '腓立比', '腓利比書', '腓利比', 'Philippians', 'Phil', 'Php'] },
  { code: 'COL', canonical: '歌羅西書', english: 'Colossians', chapters: 4, aliases: ['歌羅西書', '歌羅西', 'Colossians', 'Col'] },
  { code: '1TH', canonical: '帖撒羅尼迦前書', english: '1 Thessalonians', chapters: 5, aliases: ['帖撒羅尼迦前書', '帖前', '1 Thessalonians', '1Thessalonians', '1 Thess', '1Thess', '1 Thes', '1Thes'] },
  { code: '2TH', canonical: '帖撒羅尼迦後書', english: '2 Thessalonians', chapters: 3, aliases: ['帖撒羅尼迦後書', '帖後', '2 Thessalonians', '2Thessalonians', '2 Thess', '2Thess', '2 Thes', '2Thes'] },
  { code: '1TI', canonical: '提摩太前書', english: '1 Timothy', chapters: 6, aliases: ['提摩太前書', '提前', '1 Timothy', '1Timothy', '1 Tim', '1Tim'] },
  { code: '2TI', canonical: '提摩太後書', english: '2 Timothy', chapters: 4, aliases: ['提摩太後書', '提後', '2 Timothy', '2Timothy', '2 Tim', '2Tim'] },
  { code: 'TIT', canonical: '提多書', english: 'Titus', chapters: 3, aliases: ['提多書', '提多', 'Titus', 'Tit'] },
  { code: 'PHM', canonical: '腓利門書', english: 'Philemon', chapters: 1, aliases: ['腓利門書', '腓利門', 'Philemon', 'Phlm', 'Phm'] },
  { code: 'HEB', canonical: '希伯來書', english: 'Hebrews', chapters: 13, aliases: ['希伯來書', '希伯來', 'Hebrews', 'Heb'] },
  { code: 'JAS', canonical: '雅各書', english: 'James', chapters: 5, aliases: ['雅各書', '雅各', 'James', 'Jas'] },
  { code: '1PE', canonical: '彼得前書', english: '1 Peter', chapters: 5, aliases: ['彼得前書', '彼前', '1 Peter', '1Peter', '1 Pet', '1Pet'] },
  { code: '2PE', canonical: '彼得後書', english: '2 Peter', chapters: 3, aliases: ['彼得後書', '彼後', '2 Peter', '2Peter', '2 Pet', '2Pet'] },
  { code: '1JN', canonical: '約翰一書', english: '1 John', chapters: 5, aliases: ['約翰一書', '約壹', '約一', '1 John', '1John', '1 Jn', '1Jn'] },
  { code: '2JN', canonical: '約翰二書', english: '2 John', chapters: 1, aliases: ['約翰二書', '約貳', '約二', '2 John', '2John', '2 Jn', '2Jn'] },
  { code: '3JN', canonical: '約翰三書', english: '3 John', chapters: 1, aliases: ['約翰三書', '約參', '約三', '3 John', '3John', '3 Jn', '3Jn'] },
  { code: 'JUD', canonical: '猶大書', english: 'Jude', chapters: 1, aliases: ['猶大書', '猶大', 'Jude', 'Jud'] },
  { code: 'REV', canonical: '啟示錄', english: 'Revelation', chapters: 22, aliases: ['啟示錄', '啟', 'Revelation', 'Rev'] },
]);

const FULLWIDTH_DIGITS = '０１２３４５６７８９';
const SCRIPTURE_BOOK_ALIAS_ENTRIES = Object.freeze(SCRIPTURE_BOOKS
  .flatMap(book => book.aliases.map(alias => ({ alias, key: normalizeAliasKey(alias), book })))
  .sort((a, b) => b.key.length - a.key.length));

function normalizeFullwidthDigits(value = '') {
  return String(value || '').replace(/[０-９]/g, char => String(FULLWIDTH_DIGITS.indexOf(char)));
}

function normalizeReferenceInput(value = '') {
  return normalizeFullwidthDigits(value)
    .replace(/[：]/g, ':')
    .replace(/[–—~～－]/g, '-')
    .replace(/(\d+)\s*[篇章]\s*(\d+)/g, '$1:$2')
    .replace(/[\u00a0\u3000]/g, ' ')
    .replace(/\s*([:;,\-])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeAliasKey(value = '') {
  return normalizeReferenceInput(value).replace(/\s+/g, '').toLocaleLowerCase();
}

function findBookMatch(normalized = '') {
  const compact = normalized.replace(/\s+/g, '').toLocaleLowerCase();
  for (const entry of SCRIPTURE_BOOK_ALIAS_ENTRIES) {
    if (compact === entry.key) return { book: entry.book, rest: '' };
    if (!compact.startsWith(entry.key)) continue;
    const restCompact = compact.slice(entry.key.length);
    if (!restCompact || /^[\d:：\-]/.test(restCompact)) {
      const rawRest = normalized.slice(entry.alias.length).trim();
      return { book: entry.book, rest: rawRest || restCompact };
    }
  }
  return null;
}

function parseNumber(value) {
  const number = Number.parseInt(value, 10);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function isValidChapter(book, chapter) {
  return Number.isInteger(chapter) && chapter >= 1 && chapter <= book.chapters;
}

function buildNormalizedReference(book, range) {
  if (Array.isArray(range.ranges) && range.ranges.length > 1) {
    return `${book.canonical} ${range.ranges.map(item => item.startChapter).join(', ')}`;
  }
  const chapterText = range.startChapter === range.endChapter
    ? String(range.startChapter)
    : `${range.startChapter}-${range.endChapter}`;
  if (range.wholeChapter) {
    return book.chapters === 1 && range.startChapter === 1 && range.endChapter === 1
      ? book.canonical
      : `${book.canonical} ${chapterText}`;
  }
  const start = `${range.startChapter}:${range.startVerse}`;
  if (range.startChapter === range.endChapter && range.startVerse === range.endVerse) {
    return `${book.canonical} ${start}`;
  }
  const end = range.startChapter === range.endChapter
    ? String(range.endVerse)
    : `${range.endChapter}:${range.endVerse}`;
  return `${book.canonical} ${start}-${end}`;
}

function parseScriptureRest(book, rawRest = '') {
  const rest = normalizeReferenceInput(rawRest);
  if (!rest) {
    if (book.chapters !== 1) return null;
    return { startChapter: 1, startVerse: null, endChapter: 1, endVerse: null, wholeChapter: true };
  }

  if (/^\d+(,\d+)+$/.test(rest)) {
    const chapters = rest.split(',').map(parseNumber);
    if (chapters.some(chapter => !isValidChapter(book, chapter))) return null;
    const ranges = chapters.map(chapter => ({
      startChapter: chapter,
      startVerse: null,
      endChapter: chapter,
      endVerse: null,
      wholeChapter: true,
    }));
    return {
      ...ranges[0],
      endChapter: ranges[ranges.length - 1].endChapter,
      ranges,
      wholeChapter: true,
    };
  }

  let match = rest.match(/^(\d+)$/);
  if (match) {
    const chapter = parseNumber(match[1]);
    if (!isValidChapter(book, chapter)) return null;
    return { startChapter: chapter, startVerse: null, endChapter: chapter, endVerse: null, wholeChapter: true };
  }

  match = rest.match(/^(\d+)-(\d+)$/);
  if (match) {
    const startChapter = parseNumber(match[1]);
    const endChapter = parseNumber(match[2]);
    if (!isValidChapter(book, startChapter) || !isValidChapter(book, endChapter) || endChapter < startChapter) return null;
    return { startChapter, startVerse: null, endChapter, endVerse: null, wholeChapter: true };
  }

  match = rest.match(/^(\d+):(\d+)$/);
  if (match) {
    const startChapter = parseNumber(match[1]);
    const startVerse = parseNumber(match[2]);
    if (!isValidChapter(book, startChapter) || !startVerse) return null;
    return { startChapter, startVerse, endChapter: startChapter, endVerse: startVerse, wholeChapter: false };
  }

  match = rest.match(/^(\d+):(\d+)-(\d+)$/);
  if (match) {
    const startChapter = parseNumber(match[1]);
    const startVerse = parseNumber(match[2]);
    const endVerse = parseNumber(match[3]);
    if (!isValidChapter(book, startChapter) || !startVerse || !endVerse || endVerse < startVerse) return null;
    return { startChapter, startVerse, endChapter: startChapter, endVerse, wholeChapter: false };
  }

  match = rest.match(/^(\d+):(\d+)-(\d+):(\d+)$/);
  if (match) {
    const startChapter = parseNumber(match[1]);
    const startVerse = parseNumber(match[2]);
    const endChapter = parseNumber(match[3]);
    const endVerse = parseNumber(match[4]);
    if (!isValidChapter(book, startChapter) || !isValidChapter(book, endChapter) || !startVerse || !endVerse || endChapter < startChapter) return null;
    if (endChapter === startChapter && endVerse < startVerse) return null;
    return { startChapter, startVerse, endChapter, endVerse, wholeChapter: false };
  }

  return null;
}

export function splitScriptureReferences(raw = '') {
  return String(raw || '')
    .split(/[;；]+/)
    .map(item => item.trim())
    .filter(Boolean);
}

export function parseScriptureReference(reference = '') {
  const source = String(reference || '').trim();
  const normalizedInput = normalizeReferenceInput(source);
  if (!normalizedInput) return null;
  const match = findBookMatch(normalizedInput);
  if (!match) return null;
  const range = parseScriptureRest(match.book, match.rest);
  if (!range) return null;
  return {
    source,
    normalized: buildNormalizedReference(match.book, range),
    book: {
      code: match.book.code,
      canonical: match.book.canonical,
      english: match.book.english,
      chapters: match.book.chapters,
      oneChapter: match.book.chapters === 1,
    },
    ranges: range.ranges || [range],
    ...range,
  };
}

export function normalizeScriptureReferenceForFetch(reference = '') {
  return parseScriptureReference(reference)?.normalized || normalizeReferenceInput(reference);
}

export function isLikelyScriptureReference(reference = '') {
  return !!parseScriptureReference(reference);
}

export function getScriptureBookAliasSummary() {
  return SCRIPTURE_BOOKS.map(book => ({
    code: book.code,
    canonical: book.canonical,
    english: book.english,
    aliases: [...book.aliases],
  }));
}
