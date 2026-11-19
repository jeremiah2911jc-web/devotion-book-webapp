import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=process.argv.includes('--built')?'dist':'.';
const files=['index.html','app.js','styles.css','assets/js/reading-workspace.js','assets/css/reading-workspace.css'];
// User-authored notes and Bible content are not scanned or rewritten.
const arrows=/<span[^>]*>\s*(?:&gt;|>)\s*<\/span>|[\u2190-\u21ff\u2794-\u27bf›»]|M4 12h15m-6-6 6 6-6 6/u;
let failures=0;
for(const file of files){
  const source=await readFile(path.join(root,file),'utf8');
  for(const [index,line] of source.split('\n').entries())if(arrows.test(line)){
    console.error(`${file}:${index+1}: prohibited decorative arrow`);failures++;
  }
}
if(failures)process.exitCode=1;else console.log(`Design exclusions passed (${root}): no decorative arrow glyphs or retired arrow graphic.`);
