import {
  parseScriptureReference,
  splitScriptureReferences,
} from '../assets/js/scripture-reference-utils.js';

function fail(message) {
  throw new Error(message);
}

function expectNormalized(source, expected) {
  const parsed = parseScriptureReference(source);
  if (!parsed) fail(`${source} should parse`);
  if (parsed.normalized !== expected) {
    fail(`${source} normalized to ${parsed.normalized}, expected ${expected}`);
  }
}

[
  ['詩篇90篇9-10', '詩篇 90:9-10'],
  ['詩篇90章9-10', '詩篇 90:9-10'],
  ['詩篇 90篇9-10', '詩篇 90:9-10'],
  ['詩篇 90章9-10', '詩篇 90:9-10'],
  ['詩90篇9-10', '詩篇 90:9-10'],
  ['詩90章9-10', '詩篇 90:9-10'],
  ['創世記2篇1', '創世記 2:1'],
  ['創世記2章1', '創世記 2:1'],
  ['創2篇1', '創世記 2:1'],
  ['創2章1', '創世記 2:1'],
  ['希伯來書4章11', '希伯來書 4:11'],
  ['希伯來4章11', '希伯來書 4:11'],
  ['希伯來4:11', '希伯來書 4:11'],
  ['詩篇106:32-33', '詩篇 106:32-33'],
  ['希伯來4:1', '希伯來書 4:1'],
  ['創世記2:1', '創世記 2:1'],
  ['詩篇90:9-10', '詩篇 90:9-10'],
  ['詩90:9-10', '詩篇 90:9-10'],
  ['創2:1', '創世記 2:1'],
  ['詩篇 90', '詩篇 90'],
  ['詩篇 90-91', '詩篇 90-91'],
  ['詩篇 90,91', '詩篇 90, 91'],
].forEach(([source, expected]) => expectNormalized(source, expected));

const chineseSemicolonRefs = splitScriptureReferences('希伯來4:11；詩篇90篇9-10');
if (chineseSemicolonRefs.length !== 2) fail(`Chinese semicolon split failed: ${chineseSemicolonRefs.join(' / ')}`);

const englishSemicolonRefs = splitScriptureReferences('希伯來4:11;詩篇90章9-10');
if (englishSemicolonRefs.length !== 2) fail(`English semicolon split failed: ${englishSemicolonRefs.join(' / ')}`);

const fiveRefs = splitScriptureReferences('希伯來4:11；詩篇106:32-33；希伯來4:1；創世記2:1；詩篇90篇9-10');
if (fiveRefs.length !== 5) fail(`Five-reference split failed: ${fiveRefs.join(' / ')}`);
fiveRefs.forEach((reference) => {
  if (!parseScriptureReference(reference)) fail(`${reference} should parse in five-reference input`);
});

console.log('scripture-reference-utils validation passed');
