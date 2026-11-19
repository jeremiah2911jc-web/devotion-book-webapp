import assert from 'node:assert/strict';
import { copyFile, lstat, mkdir, readFile, realpath, rm } from 'node:fs/promises';
import path from 'node:path';

if (process.env.VERCEL === '1' && process.env.VERCEL_ENV !== 'production') {
  throw new Error('Cloud previews require an isolated backend. Use the isolated local preview until one is configured.');
}

const sourceRoot = await realpath('.');
const outputRoot = path.join(sourceRoot, 'dist');
const files = JSON.parse(await readFile('security/public-files.json', 'utf8'));
const allowedFiles = new Set(files);
assert.equal(allowedFiles.size, files.length, 'Duplicate entries in the public file list');

await rm(outputRoot, { recursive: true, force: true });
for (const file of files) {
  assert(file.split('/').every(part => /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(part)), `Invalid public path: ${file}`);
  const source = path.join(sourceRoot, file);
  assert((await lstat(source)).isFile() && await realpath(source) === source, `Public source must be a regular file: ${file}`);
  const output = path.join(outputRoot, file);
  await mkdir(path.dirname(output), { recursive: true });
  await copyFile(source, output);
}

const html = await readFile(path.join(outputRoot, 'index.html'), 'utf8');
for (const [, url] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (/^https?:/.test(url)) continue;
  const file = url.split('?')[0].replace(/^\.?\//, '');
  assert(allowedFiles.has(file), `HTML references an asset outside the public file list: ${file}`);
}
console.log(`Public build completed from an explicit list of ${files.length} files.`);
