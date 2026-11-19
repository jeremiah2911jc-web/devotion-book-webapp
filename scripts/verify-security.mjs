import {readFile,readdir,lstat} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const built=process.argv.includes('--built');
const inventory=JSON.parse(await readFile('security/api-inventory.json','utf8'));
const api=(await readdir('api')).filter(file=>file.endsWith('.js')).sort();
assert.deepEqual(inventory.map(item=>item.file).sort(),api,'API inventory must match deployable functions');
assert(!api.includes('support-receipt-request.js'),'The retired receipt endpoint must not be deployed');
const settings=JSON.parse(await readFile('vercel.json','utf8'));
const headers=settings.headers.flatMap(entry=>entry.headers);
for(const key of ['Content-Security-Policy','X-Content-Type-Options','X-Frame-Options'])assert(headers.some(h=>h.key===key),`Missing ${key}`);
assert.equal(settings.outputDirectory,'dist');
assert.equal(settings.buildCommand,'npm run build');
const deny=/(^|\/)(?:\.env[^/]*|\.git|AGENTS\.md|docs|tests|scripts|schema\.sql|api|security|node_modules|work|artifacts)(\/|$)|\.map$|\.(?:pem|p12|key|sqlite|bak)$/i;
async function walk(root,rel=''){
 const files=[];for(const entry of await readdir(path.join(root,rel),{withFileTypes:true})){
  const next=path.join(rel,entry.name);const stat=await lstat(path.join(root,next));assert(!stat.isSymbolicLink(),`Symlink in output: ${next}`);
  assert(!deny.test(next),`Private path in public output: ${next}`);
  if(entry.isDirectory())files.push(...await walk(root,next));else files.push(next);
 }return files;
}
if(built){
 const files=await walk('dist');
 const allowedFiles=JSON.parse(await readFile('security/public-files.json','utf8'));
 assert.deepEqual(files.sort(),allowedFiles.sort(),'Public output must exactly match the public file list');
 for(const required of ['index.html','app.js','styles.css','version.json','manifest.webmanifest','assets/js/reading-workspace.js','assets/js/offline-notes.js','service-worker.js','assets/vendor/supabase.js','assets/css/reading-workspace.css'])assert(files.includes(required),`Missing public asset ${required}`);
 for(const file of files.filter(file=>/\.(?:js|html|css|json|webmanifest)$/.test(file))){
  const text=await readFile(path.join('dist',file),'utf8');
  assert(!/support-receipt-request|support-payment-section|support-receipt-form|支持平台／支持事工/.test(text),`Retired support feature in ${file}`);
  assert(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sb_secret_[A-Za-z0-9_-]+|gh[pousr]_[A-Za-z0-9]{20,}|(?:postgres|postgresql):\/\/[^\s"']+/.test(text),`Secret material in public asset ${file}`);
  for(const match of text.matchAll(/eyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g)){
   let payload;try{payload=JSON.parse(Buffer.from(match[1],'base64url'));}catch{continue;}
   assert.equal(payload.role,'anon',`Unexpected privileged or session token in ${file}`);
  }
 }
 console.log(`Public output checks passed: ${files.length} allowlisted files; no private directories or privileged credentials.`);
}else console.log('Source security checks passed: API inventory, build target and security headers.');
