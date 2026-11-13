import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
const root=process.argv.includes('--built')?'dist':'.';
const files=['index.html','app.js','assets/js/reading-workspace.js','assets/js/offline-notes.js',...(root==='.'?['tests/fixtures/design-preview-notes.json']:[])];
const blocked=['讀到這裡','接著寫','真正','從來','口徑','對帳','補款','往往','其實','很多時候','值得注意的是','更重要的是','這也提醒我們','讓我們先思考','值得警醒','值得追問','同樣要回答','有一個更前面的問題','背後還有一個問題','一個很深的','整理情緒','需要一直記得','我們很容易問','長出來','處理','怎麼','為什麼','？'];
const patterns=[/<h[1-6][^>]*>[^<]*(什麼|差在哪裡)/u,/不只是[^。\n]{0,100}而是/u,/不是[^。\n]{0,100}而是/u,/不在[^。\n]{0,100}而在/u,/不能只[^。\n]{0,100}還要/u,/(不能|無法|不足以)據?此?認定/u];
let failures=0;
for(const file of files){
 const raw=await readFile(path.join(root,file),'utf8');
 const text=raw.replace(/\\u\{([a-fA-F0-9]+)\}|\\u([a-fA-F0-9]{4})/g,(_,a,b)=>String.fromCodePoint(parseInt(a||b,16)));
 for(const [i,line] of text.split('\n').entries())if(blocked.some(word=>line.includes(word))||patterns.some(pattern=>pattern.test(line))){console.error(`${file}:${i+1}: platform copy review required`);failures++;}
}
if(failures)process.exitCode=1;else console.log(`Platform copy checks passed (${root}); source documents and user-authored content excluded.`);
