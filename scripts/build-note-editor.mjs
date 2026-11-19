import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';

const dependencies = [
  'orderedmap', 'rope-sequence', 'w3c-keyname',
  'prosemirror-commands', 'prosemirror-history', 'prosemirror-keymap',
  'prosemirror-model', 'prosemirror-schema-list', 'prosemirror-state',
  'prosemirror-transform', 'prosemirror-view',
];
const notices = await Promise.all(dependencies.map(async name => {
  const license = await readFile(`node_modules/${name}/LICENSE`, 'utf8');
  return `${name}\n${license.trim()}`;
}));
await build({
  entryPoints: ['src/note-editor.js'],
  outfile: 'assets/vendor/note-editor.js',
  bundle: true,
  format: 'esm',
  target: 'safari16',
  minify: true,
  banner: { js: `/*!\n${notices.join('\n\n').replaceAll('*/', '* /')}\n*/` },
});
