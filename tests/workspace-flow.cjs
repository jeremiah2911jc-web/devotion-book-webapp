const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {seedLocalUserState,createNote,STORAGE_KEYS,exportEpubAndCaptureDownload}=require('./helpers/devotion-test-helpers.cjs');
const {spawn}=require('node:child_process');
const url=process.env.WORKSPACE_TEST_URL||'http://127.0.0.1:4195/';
let ownedServer;
async function ensureServer(){if(process.env.WORKSPACE_TEST_URL)return;ownedServer=spawn(process.execPath,['static-server.cjs'],{env:{...process.env,PORT:'4195',DEVOTION_ISOLATED_PREVIEW:'1',DEVOTION_SERVE_DIST:'1',DEVOTION_TEST_CLEAN_URLS:'1'},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Preview server unavailable')),10000);ownedServer.once('exit',code=>{clearTimeout(timer);reject(new Error(`Preview server exited ${code}`));});ownedServer.stdout.on('data',chunk=>{if(String(chunk).includes('static server running')){clearTimeout(timer);resolve();}});});}
const user={id:'workspace-reader-a',email:'preview@example.invalid'};
const notes=['first','second'].map((id,i)=>createNote({id,userId:user.id,title:i?'另一篇閱讀紀錄':'來源與閱讀紀錄',content:'這是供操作驗收使用的合成文字。',status:'published'}));
const book={id:'workspace-book',user_id:user.id,title:'閱讀紀錄選集',author_name:'預覽作者',description:'合成書稿。',template_code:'devotion',language:'zh-TW',toc_enabled:true,chapters:[{id:'chapter-first',note_id:'first',chapter_title:'來源與閱讀紀錄',chapter_order:0,include_in_toc:true}],created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
async function view(page,name){const direct=page.locator(`.devotion-masthead [data-workspace-view="${name}"]`);if(await direct.count())return direct.click();await page.locator('[data-workspace-menu]').click();await page.locator(`#workspace-menu [data-workspace-view="${name}"]`).click();}
async function read(page,title){await view(page,'note-reader');await page.locator('[data-testid="note-reader-recent-card"]').filter({hasText:title}).click();await page.locator('[data-testid="note-reader-reading-modal"]:not(.hidden)').waitFor();}
(async()=>{const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});const page=await context.newPage();const results=[];const requests=[];
context.on('request',request=>requests.push(request.url()));
try{
 await ensureServer();
 if (!process.env.WORKSPACE_TEST_URL) {
   const redirect = await fetch(new URL('/index.html', url), {redirect:'manual'});
   assert.equal(redirect.status, 308);
   assert.equal(redirect.headers.get('location'), '/');
 }
 await page.goto(url);await page.locator('#auth-gate').waitFor();
 await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, {timeout:15000});
 assert.equal(await page.evaluate(async () => (await caches.match('/'))?.redirected), false);
 await seedLocalUserState(page,{user,notes,books:[book],snapshots:[]});await page.reload();
 results.push('首頁在正式轉址條件下，受離線功能接管後仍可重新開啟。');
 await page.locator('.devotion-masthead').waitFor();await page.locator('[data-workspace-menu]').click();await page.keyboard.press('Escape');await page.locator('#workspace-menu').waitFor({state:'hidden'});await page.waitForFunction(()=>document.querySelector('[data-workspace-menu]')?.getAttribute('aria-expanded')==='false');assert.equal(await page.locator('[data-workspace-menu]').getAttribute('aria-expanded'),'false');assert.equal(await page.locator('[data-workspace-menu]').evaluate(el=>document.activeElement===el),true);results.push('選單可用 Escape 關閉，焦點回到入口。');
 await read(page,'來源與閱讀紀錄');await page.locator('[data-testid="note-reader-reading-edit"]').click();await page.locator('.writing-connections summary').click();
 await page.getByTestId('note-editor-content').press('ControlOrMeta+End');
 await page.getByTestId('note-scripture').fill('詩篇 23:1');
 await page.getByRole('button',{name:'帶入經文',exact:true}).click();
 await page.locator('#scripture-fetch-status').getByText('已帶出 1 處',{exact:true}).waitFor();
 await page.locator('#workspace-related-select').selectOption('second');await page.locator('#workspace-source-title').fill('參考文章');await page.locator('#workspace-source-url').fill('javascript:alert(1)');await page.locator('#workspace-add-source').click();assert.match(await page.locator('#workspace-source-message').innerText(),/完整/);
 await page.locator('#workspace-source-url').fill('https://example.org/reading');await page.locator('#workspace-source-position').fill('第 8 頁');await page.locator('#workspace-add-source').click();await page.locator('#publish-note-btn').click();await page.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('札記已儲存'));
 const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).find(note=>note.id==='first'),STORAGE_KEYS.notes);assert(saved.summary.includes('devotion-note-summary-settings:'));assert(!('sources' in saved));assert(!('related_notes' in saved));
 await page.reload();await read(page,'來源與閱讀紀錄');await page.locator('.note-connections-reading a').waitFor();assert.equal(await page.locator('.note-connections-reading a').getAttribute('href'),'https://example.org/reading');assert.match(await page.locator('[data-testid="note-reader-reading-content"]').innerText(),/第 8 頁/);await page.locator('[data-open-related-note="second"]').click();await page.locator('[data-open-related-note="first"]').waitFor();results.push('關聯、反向連結、來源與頁碼保存後可重新讀取；可執行網址遭拒絕。');
 await page.locator('[data-testid="note-reader-reading-close"]').click();await page.locator('[data-workspace-new]').click();await page.locator('#note-content').fill('只有一行，也可以先存下來。');await page.locator('#publish-note-btn').click();await page.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('札記已儲存'));
 const short=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).find(note=>note.content==='只有一行，也可以先存下來。'),STORAGE_KEYS.notes);assert(short&&short.title.endsWith('札記'));results.push('未填標題的短記可用日期保存。');
 await view(page,'books');await page.locator('[data-testid="book-open-export-settings"]').click();await page.locator('#save-and-export-book-btn').click();await page.locator('[data-testid="download-exported-book"]').waitFor({state:'visible'});const output=await exportEpubAndCaptureDownload(page);const bytes=fs.readFileSync(output.filePath);assert(bytes.includes(Buffer.from('application/epub+zip')));assert(bytes.includes(Buffer.from('https://example.org/reading')));assert(bytes.includes(Buffer.from('第 8 頁')));assert(bytes.includes(Buffer.from('<blockquote class="note-scripture-quotation"><strong>詩篇 23:1</strong><p><sup>1</sup>')));fs.copyFileSync(output.filePath,path.join('artifacts','workspace-sources.epub'));results.push('實際 EPUB 已產生，章節保留來源與有出處的經文區塊。');
 await page.locator('#close-book-draft-modal-btn').click();await page.locator('[data-workspace-new]').click();await page.locator('#note-content').fill('這段尚未按保存，重新開啟後要接續。');await page.waitForFunction(key=>(localStorage.getItem(key)||'').includes('這段尚未按保存'),`${STORAGE_KEYS.currentNoteDraft}:${user.id}`);await page.reload();await page.locator('#note-content').waitFor();assert.match(await page.locator('#note-content').inputValue(),/這段尚未按保存/);results.push('瀏覽器草稿重新開啟後接續原文。');
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{timeout:15000});await context.setOffline(true);await page.reload();await page.locator('#note-content').waitFor();assert.match(await page.locator('#note-content').inputValue(),/這段尚未按保存/);await page.locator('#note-content').fill('離線新增的文字仍可儲存。');
 await page.getByTestId('note-extra-actions-toggle').click();
 await page.getByTestId('note-save-draft').click();
 await page.waitForFunction(() => document.querySelector('[data-testid=note-extra-actions-toggle]').getAttribute('aria-expanded') === 'false');
 await page.waitForFunction(key=>(localStorage.getItem(key)||'').includes('離線新增的文字'),STORAGE_KEYS.notes);const cacheUrls=await page.evaluate(async()=>{const names=await caches.keys();return (await Promise.all(names.map(async name=>(await(await caches.open(name)).keys()).map(req=>req.url)))).flat()});assert(!cacheUrls.some(value=>/\/api\/|supabase|access_token|preview-seed/.test(value.replace('/assets/vendor/supabase.js','/sdk.js'))));results.push('曾載入的網站可離線重開、接續與保存本機札記；公開快取未含 API 或登入回應。');
 await context.setOffline(false);await page.locator('[data-workspace-menu]').click();await page.locator('[data-workspace-signout]').click();await page.locator('#auth-gate').waitFor();assert(!await page.locator('.personal-review').isVisible());results.push('登出後私人內容不出現在登入畫面。');
 await page.evaluate(key=>localStorage.setItem(key,JSON.stringify({id:'workspace-reader-b',email:'reader-b@example.invalid'})),STORAGE_KEYS.user);await page.reload();await page.locator('[data-workspace-new]').click();await page.locator('#note-content').waitFor();assert.equal(await page.locator('#note-content').inputValue(),'');assert.equal(await page.locator('.review-entries article').count(),0);results.push('另一身分登入後看不到前一身分的札記與草稿。');
 const forbidden=requests.filter(value=>!value.startsWith(new URL(url).origin)&&!value.startsWith('data:')&&!value.startsWith('blob:'));assert.deepEqual(forbidden,[]);results.push('本次瀏覽器流程的請求全部留在本機。');
 fs.writeFileSync('artifacts/workspace-flow-results.json',JSON.stringify({passed:true,results},null,2));console.log(results.join('\n'));
}catch(error){await page.screenshot({path:'artifacts/workspace-flow-failure.png',fullPage:true});throw error;}finally{await browser.close();ownedServer?.kill('SIGTERM');}})().catch(error=>{console.error(error);process.exit(1)});
