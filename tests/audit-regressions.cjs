const {chromium}=require('playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {seedLocalUserState,createNote}=require('./helpers/devotion-test-helpers.cjs');
const port='4202',url=`http://127.0.0.1:${port}/index.html`;
const user={id:'full-audit-reader',email:'audit@example.invalid'};
const data={user,notes:[createNote({id:'audit-note',userId:user.id,title:'詩篇 119:105',content:'你的話是我腳前的燈，是我路上的光。',scripture:'詩篇119:105'})],books:[],snapshots:[]};
const checks=[];
async function capture(page,name){await page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>Number.isFinite(a.effect?.getTiming().iterations)).map(a=>a.finished.catch(()=>{}))));await page.screenshot({path:`artifacts/audit-${name}.png`});}
async function navigate(page,name){await page.getByRole('button',{name:'選單',exact:true}).click();await page.locator('#workspace-menu').getByRole('button',{name,exact:true}).click();}
(async()=>{const server=spawn(process.execPath,['static-server.cjs'],{env:{...process.env,PORT:port,DEVOTION_ISOLATED_PREVIEW:'1',DEVOTION_SERVE_DIST:'1'},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Server timeout')),10000);server.stdout.on('data',chunk=>{if(String(chunk).includes('static server running')){clearTimeout(timer);resolve()}});server.on('exit',code=>reject(new Error(`Server exited ${code}`)))});const browser=await chromium.launch({headless:true});try{const context=await browser.newContext({viewport:{width:1280,height:800}});const page=await context.newPage();await page.goto(url);await seedLocalUserState(page,data);await page.reload();await page.locator('.devotion-masthead').waitFor();
 await navigate(page,'電子書櫃');await page.getByTestId('library-open-reader').click();const close=page.getByTestId('reader-close');await close.waitFor();await page.waitForFunction(()=>document.querySelector('#view-reader')?.textContent.includes('聖經'));const hit=await close.evaluate(el=>{const rect=el.getBoundingClientRect();const top=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);return top===el||el.contains(top)});checks.push({id:'reader-close-hit',passed:hit,description:'閱讀器關閉按鈕在初始位置沒有被其他元件遮住'});
 if(hit){
   for(const [label,name] of [['目錄','目錄'],['搜尋','搜尋書籍'],['主題與設定','主題與設定'],['書籤','閱讀位置與書籤']]){
     await page.getByRole('button',{name:'閱讀功能',exact:true}).click();
     const items=page.locator('#reader-panel-root [role="menuitem"]');assert(!/[>›»]/u.test(await items.allTextContents().then(text=>text.join(''))));
     await page.getByRole('menuitem',{name:label,exact:true}).click();
     await page.getByRole('dialog',{name,exact:true}).waitFor();
     if(label==='搜尋'){await page.locator('#reader-search-field').fill('起初');await page.locator('[data-reader-search-chapter-index]').first().waitFor({timeout:15000});}
     if(label==='書籤'){await page.locator('[data-reader-bookmark-toggle]').click();await page.getByRole('button',{name:'移除目前位置書籤',exact:true}).waitFor();}
     await capture(page,`reader-${label}`);checks.push({id:`reader-panel-${label}`,passed:true,description:`閱讀器${label}入口與操作可用`});
     await page.keyboard.press('Escape');await page.getByRole('dialog',{name,exact:true}).waitFor({state:'hidden'});
   }
 }
if(hit){await capture(page,'reader');await close.click();}else await page.locator('.devotion-name').click();
 await page.locator('.devotion-name').click();await page.locator('[data-review-reading="0"]').click();await page.locator('#today-reading-dialog:not(.hidden)').waitFor();const locked=await page.evaluate(()=>getComputedStyle(document.documentElement).overflowY==='hidden'&&getComputedStyle(document.body).overflowY==='visible');checks.push({id:'reading-background-lock',passed:locked,description:'經文視窗開啟時背景停止捲動'});await page.keyboard.press('Escape');await page.locator('#today-reading-dialog').waitFor({state:'hidden'});
 await page.getByRole('button',{name:'選單',exact:true}).click();await page.locator('#workspace-menu').getByRole('button',{name:'帳號設定',exact:true}).click();checks.push({id:'local-sync-disabled',passed:await page.getByTestId('account-settings-sync-button').isDisabled(),description:'未連線雲端時停用雲端同步'});await page.locator('#close-account-settings-btn').click();
 for(const [name,view] of [['選取札記','content-library'],['電子書櫃','library'],['選稿編排','books']]){await navigate(page,name);checks.push({id:`heading-${view}`,passed:await page.locator(`#view-${view} .workspace-page-heading h1`).isVisible(),description:`${name}有明確的頁名`});}
 await page.getByRole('button',{name:'選單',exact:true}).click();await page.locator('#workspace-menu').getByRole('button',{name:'登出',exact:true}).click();await page.getByTestId('auth-open-login').click();const modal=page.getByTestId('auth-modal');await modal.waitFor();await capture(page,'auth-login');checks.push({id:'auth-dialog-role',passed:await modal.getAttribute('role')==='dialog'&&await modal.getAttribute('aria-modal')==='true',description:'登入視窗具備對話框語意與模態狀態'});await page.keyboard.press('Escape');
 fs.writeFileSync('artifacts/audit-regressions.json',JSON.stringify({passed:checks.every(item=>item.passed),checks},null,2));console.log(checks.map(item=>`${item.passed?'PASS':'FAIL'} ${item.id}`).join('\n'));assert(checks.every(item=>item.passed),'Audit regressions remain');
 }finally{await browser.close();server.kill('SIGTERM')}})().catch(error=>{console.error(error.message);process.exitCode=1});
