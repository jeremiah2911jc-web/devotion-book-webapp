import {cp,mkdir,readFile,rm,readdir} from 'node:fs/promises';
import path from 'node:path';
if (process.env.VERCEL === '1' && process.env.VERCEL_ENV !== 'production') {
  throw new Error('Cloud previews require an isolated backend. Use the isolated local preview until one is configured.');
}
const root=path.resolve('dist');
await rm(root,{recursive:true,force:true});await mkdir(root,{recursive:true});
for(const name of ['index.html','styles.css','app.js','version.json','manifest.webmanifest','favicon.ico','service-worker.js','assets'])await cp(name,path.join(root,name),{recursive:true,dereference:false});
const html=await readFile(path.join(root,'index.html'),'utf8');
const assets=[...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(match=>match[1]).filter(url=>!/^https?:/.test(url));
for(const asset of assets){const local=asset.split('?')[0].replace(/^\.?\//,'');await readFile(path.join(root,local));}
console.log('Public build completed from the explicit static asset list.');
