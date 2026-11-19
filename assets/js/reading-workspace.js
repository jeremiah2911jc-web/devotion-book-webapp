const escape = (value = '') => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function editorialTitle(value){
  if(typeof Intl.Segmenter!=='function')return escape(value);
  const chunks=[];
  for(const part of new Intl.Segmenter('zh-Hant',{granularity:'word'}).segment(value)){
    const word=part.segment;
    if(/^[章篇節卷]$/.test(word)&&chunks.length>1&&/^\s+$/.test(chunks.at(-1))&&/^[0-9]+(?:[-–][0-9]+)*$/.test(chunks.at(-2))){const space=chunks.pop();chunks[chunks.length-1]+=space+word;}
    else if(chunks.length&&(/^[一二三四五六七八九十百千零〇兩章篇節卷]+$/.test(word)&&/^[一二三四五六七八九十百千零〇兩章篇節卷]+$/.test(chunks.at(-1))||/^[\p{P}\p{S}]+$/u.test(word)))chunks[chunks.length-1]+=word;
    else chunks.push(word);
  }
  return chunks.map(word=>/^\s+$/.test(word) ? escape(word) : `<span class="folio-title-word">${escape(word)}</span>`).join('');
}

export function normalizeNoteConnections(value = {}) {
  return {
    related_notes: [...new Set((Array.isArray(value.related_notes) ? value.related_notes : []).filter(id => typeof id === 'string' && id.length < 200))].slice(0, 30),
    sources: (Array.isArray(value.sources) ? value.sources : []).filter(item => {
      try { return ['https:', 'http:'].includes(new URL(item.url).protocol); } catch { return false; }
    }).slice(0, 20).map(item => ({url: String(item.url).slice(0, 3000), title: String(item.title || '').slice(0, 200), position: String(item.position || '').slice(0, 200)})),
  };
}

export function createReadingWorkspace(api) {
  const {state, els} = api;
  let editorConnections = normalizeNoteConnections();
  let loadedNoteId = null;
  let reviewSignature = '';
  let activeOwner = state.currentUser?.id || '';
  const dateLabel = value => {const date=new Date(value||Date.now());return Number.isNaN(date.getTime())?'日期未記錄':new Intl.DateTimeFormat('zh-TW',{month:'long',day:'numeric'}).format(date);};
  const root = document.querySelector('.app-shell');
  document.body.classList.add('reading-workspace','editorial-workspace');
  const masthead = document.createElement('header');
  masthead.className = 'devotion-masthead';
  masthead.innerHTML = `<button class="devotion-name" type="button" data-workspace-view="dashboard"><span>DEVOTION</span><small>靈修札記</small></button>
    <nav aria-label="常用操作"><button type="button" data-workspace-reading>讀經</button><button type="button" data-workspace-view="note-reader">找札記</button><button type="button" data-workspace-new class="masthead-write">寫札記</button><button type="button" data-workspace-menu aria-expanded="false" aria-controls="workspace-menu">選單</button></nav>`;
  root.prepend(masthead);
  for(const [view,label] of [['prayer','禱告紀錄'],['notes','寫札記'],['content-library','選取札記'],['books','選稿編排'],['library','電子書櫃']]){
    const section=document.getElementById(`view-${view}`);if(!section)continue;
    const heading=document.createElement('header');heading.className='workspace-page-heading';heading.innerHTML=`<h1>${label}</h1>`;section.prepend(heading);
  }
  const menu = document.createElement('dialog');
  menu.id = 'workspace-menu';
  menu.className = 'workspace-menu';
  menu.setAttribute('aria-label', '選單');
  menu.innerHTML = `<div class="workspace-dialog-heading"><h2>選單</h2><button type="button" data-workspace-close>關閉</button></div><nav aria-label="全部操作">${[
    ['dashboard','首頁'],['notes','接續書寫'],['note-reader','找札記'],['prayer','禱告紀錄'],['content-library','選取札記'],['books','選稿編排'],['library','電子書櫃'],['manual','操作手冊']
  ].map(([view,label])=>`<button type="button" data-workspace-view="${view}">${label}</button>`).join('')}</nav><div class="workspace-menu-account"><button type="button" data-workspace-account>帳號設定</button><button type="button" data-workspace-sync-pending>同步</button><button type="button" data-workspace-signout>登出</button></div><p data-workspace-sync></p><div data-workspace-pending></div><p class="workspace-offline-help">離線可編輯已載入的札記。禱告、編書及書櫃的雲端功能需連線。</p>`;
  document.body.append(menu);
  const shelf = document.createElement('dialog');
  shelf.className = 'workspace-reading-shelf';
  shelf.id = 'workspace-reading-shelf';
  shelf.setAttribute('aria-label', '讀經');
  shelf.innerHTML = `<div class="workspace-dialog-heading"><h2>讀經</h2><button type="button" data-shelf-close>關閉</button></div>`;
  const openShelf = () => {
    if (!shelf.open) shelf.showModal();
  };
  const today = document.querySelector('.home-today-reading-card');
  if (today) shelf.append(today);
  document.body.append(shelf);
  masthead.querySelector('[data-workspace-menu]').addEventListener('click', () => {menu.showModal(); masthead.querySelector('[data-workspace-menu]').setAttribute('aria-expanded','true');});
  const closeMenu = () => {menu.close(); masthead.querySelector('[data-workspace-menu]').setAttribute('aria-expanded','false');};
  menu.querySelector('[data-workspace-close]').addEventListener('click',closeMenu);
  menu.addEventListener('close',()=>masthead.querySelector('[data-workspace-menu]').setAttribute('aria-expanded','false'));
  menu.querySelector('[data-workspace-account]').addEventListener('click',()=>{closeMenu();api.openAccountSettings();});
  menu.querySelector('[data-workspace-sync-pending]').addEventListener('click',()=>api.syncPending());
  menu.querySelector('[data-workspace-pending]').addEventListener('click',event=>{const button=event.target.closest('[data-pending-copy]');if(button)api.copyPending(button.dataset.pendingCopy).catch(api.onError);});
  menu.querySelector('[data-workspace-signout]').addEventListener('click',()=>{closeMenu();api.signOut().catch(api.onError);});
  document.querySelectorAll('[data-workspace-view]').forEach(button => button.addEventListener('click',()=>{if(menu.open)closeMenu();api.setView(button.dataset.workspaceView);}));
  masthead.querySelector('[data-workspace-new]').addEventListener('click',async()=>{if(!await api.prepareNewNote())return;api.clearNoteForm({clearDraft:true});api.setView('notes');els.noteContent.focus();});
  masthead.querySelector('[data-workspace-reading]').addEventListener('click', openShelf);
  shelf.querySelector('[data-shelf-close]').addEventListener('click',()=>shelf.close());
  shelf.addEventListener('click',event=>{if(event.target.closest('[data-today-reading-index], #today-reading-note-btn'))shelf.close();});
  [menu,shelf].forEach(dialog => dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();}));

  // Keep the established editor and its event-bound controls as the document.
  const form = els.noteForm;
  const title = form.querySelector('.note-title-field');
  const top = document.createElement('div');
  top.className = 'writing-dateline';
  top.innerHTML = `<span id="workspace-writing-date"></span><span id="workspace-writing-status" role="status"></span>`;
  form.prepend(top);
  if(title) {top.after(title); title.firstChild.textContent=''; els.noteTitle.setAttribute('aria-label','札記標題');els.noteTitle.placeholder='札記標題（選填）';}
  els.noteContent.placeholder='札記內容';
  els.noteContent.rows=6;
  const tools = form.querySelector('.note-actions-card');
  tools.classList.add('writing-savebar');
  tools.querySelector('h3').textContent='儲存與閱讀';
  const detailsWrap = document.createElement('div');
  detailsWrap.className='writing-details';
  for(const [selector,label] of [['.note-prayer-section','禱告'],['.note-organize-section','分類與摘要'],['.note-drafts-panel','其他草稿']]) {
    const section=form.querySelector(selector);if(!section)continue;
    const detail=document.createElement('details');detail.innerHTML=`<summary>${label}<span aria-hidden="true">＋</span></summary>`;detail.append(section);detailsWrap.append(detail);
  }
  const writingSurface = form.querySelector('.note-main-writing');
  const writingAside = document.createElement('aside');
  writingAside.className = 'writing-reference';
  writingAside.setAttribute('aria-label', '經文與札記設定');
  const scripture = form.querySelector('.note-scripture-section');
  scripture.querySelector('.note-scripture-label-text').textContent = '經文出處';
  scripture.querySelector('#fetch-scripture-btn').textContent = '查經文';
  const appendToggle = scripture.querySelector('.note-scripture-toggle');
  const appendLabel = appendToggle.querySelector('.note-helper-full');
  appendLabel.classList.remove('note-helper-full');
  appendLabel.textContent = '查詢後將經文加入札記';
  appendToggle.querySelector('.note-helper-short').remove();
  appendToggle.classList.add('writing-append-toggle');
  scripture.querySelector('.note-scripture-control-row').after(appendToggle);
  const shelfButton = document.createElement('button');
  shelfButton.type = 'button';
  shelfButton.className = 'writing-reading-link';
  shelfButton.textContent = '開啟今日讀經';
  shelfButton.addEventListener('click', openShelf);
  scripture.append(shelfButton);
  writingAside.append(scripture, detailsWrap);
  writingSurface.prepend(top, title);
  writingSurface.append(tools);
  form.append(writingAside);
  const connectionDetail=document.createElement('details');
  connectionDetail.className='writing-connections';
  connectionDetail.innerHTML=`<summary>關聯札記與來源<span aria-hidden="true">＋</span></summary><div class="connection-body"><label>關聯札記<select id="workspace-related-select"><option value="">選擇一篇札記</option></select></label><div id="workspace-related-list"></div><fieldset><legend>引用來源</legend><label>名稱<input id="workspace-source-title" placeholder="講道、書籍或文章名稱"></label><label>網址<input id="workspace-source-url" type="url" placeholder="https://"></label><label>位置<input id="workspace-source-position" placeholder="頁碼或影片時間"></label><button type="button" id="workspace-add-source">加入來源</button><p id="workspace-source-message" role="status"></p></fieldset><div id="workspace-source-list"></div></div>`;
  detailsWrap.prepend(connectionDetail);
  const relatedSelect=document.getElementById('workspace-related-select');
  const dirty=()=>{state.noteConnections=editorConnections;state.noteDraftDirty=true;api.persistDraft();renderEditorConnections();};
  relatedSelect.addEventListener('change',()=>{if(relatedSelect.value&&!editorConnections.related_notes.includes(relatedSelect.value))editorConnections.related_notes.push(relatedSelect.value);relatedSelect.value='';dirty();});
  document.getElementById('workspace-add-source').addEventListener('click',()=>{
    const url=document.getElementById('workspace-source-url').value.trim();
    const next=normalizeNoteConnections({sources:[{url,title:document.getElementById('workspace-source-title').value.trim(),position:document.getElementById('workspace-source-position').value.trim()}]});
    document.getElementById('workspace-source-message').textContent=next.sources.length?'':'請輸入完整的來源網址。';
    if(!next.sources.length)return;
    editorConnections.sources.push(next.sources[0]);dirty();
    ['title','url','position'].forEach(key=>document.getElementById(`workspace-source-${key}`).value='');
  });
  connectionDetail.addEventListener('click',event=>{
    const remove=event.target.closest('[data-remove-connection]');if(!remove)return;
    const kind=remove.dataset.connectionKind;editorConnections[kind].splice(Number(remove.dataset.removeConnection),1);dirty();
  });
  const review=document.createElement('section');
  review.className='personal-review';
  document.getElementById('view-dashboard').append(review);
  review.addEventListener('click',async event=>{
    const edit=event.target.closest('[data-resume-note]');
    if(edit){
      if(els.noteId.value===edit.dataset.resumeNote&&state.noteDraftDirty){api.setView('notes');els.noteContent.focus();return;}
      if(state.noteDraftDirty&&!await api.prepareNewNote())return;
      api.populateNoteForm(edit.dataset.resumeNote,{focusEditor:true});return;
    }
    const read=event.target.closest('[data-review-note]');if(read){api.openNote(read.dataset.reviewNote);return;}
    const reading=event.target.closest('[data-review-reading]');if(reading){api.openReading(Number(reading.dataset.reviewReading));return;}
    const book=event.target.closest('[data-review-book]');if(book){api.openBook(book.dataset.reviewBook);return;}
    const view=event.target.closest('[data-review-view]');if(view){api.setView(view.dataset.reviewView);return;}
    if(event.target.closest('[data-review-new]'))masthead.querySelector('[data-workspace-new]').click();
  });
  const motion=createEditorialMotion(review,masthead);
  manageEditorialDialogFocus();
  const todayObserver=new MutationObserver(()=>renderReadingLinks());
  if(today)todayObserver.observe(today,{subtree:true,childList:true,characterData:true});

  document.body.addEventListener('click',event=>{
    const connection=event.target.closest('[data-open-related-note]');if(connection)api.openNote(connection.dataset.openRelatedNote);
  });
  if(sessionStorage.getItem('devotion-design-preview')==='1'){
    const banner=document.createElement('div');banner.className='workspace-preview-label';banner.innerHTML='<span>設計預覽・範例資料</span><a data-preview-enter href="/preview-start.html?enter=1">返回範例</a><a href="/preview-start.html?reset=1">重設範例</a>';document.body.prepend(banner);
  }

  function loadConnections(note = {}) {loadedNoteId=els.noteId.value||'';editorConnections=normalizeNoteConnections(note);state.noteConnections=editorConnections;renderEditorConnections();}
  function refreshEditorStatus() {
    const current = state.notes.find(note => note.id === els.noteId.value);
    const date = document.getElementById('workspace-writing-date');
    const status = document.getElementById('workspace-writing-status');
    date.textContent = dateLabel(current?.created_at);
    const pending = current && !state.noteDraftDirty && state.supabase
      && api.pendingNotes().some(item => item.note.id === current.id);
    const nextStatus = state.noteSaving ? '儲存中'
      : state.noteDraftDirty ? '尚未手動儲存'
        : pending ? '已儲存於此裝置，待同步'
          : current?.status === 'draft' ? '草稿已儲存'
            : current ? '札記已儲存' : '';
    if (status.textContent !== nextStatus) status.textContent = nextStatus;
  }
  function renderEditorConnections() {
    const own=els.noteId.value;
    relatedSelect.innerHTML=`<option value="">選擇一篇札記</option>${state.notes.filter(note=>note.id!==own&&!editorConnections.related_notes.includes(note.id)).map(note=>`<option value="${escape(note.id)}">${escape(note.title||'未命名草稿')}</option>`).join('')}`;
    document.getElementById('workspace-related-list').innerHTML=editorConnections.related_notes.map((id,index)=>{const note=state.notes.find(item=>item.id===id);return `<div class="connection-row"><span>${escape(note?.title||'原札記已移除')}</span><button type="button" data-connection-kind="related_notes" data-remove-connection="${index}" aria-label="移除關聯札記">移除</button></div>`;}).join('');
    document.getElementById('workspace-source-list').innerHTML=editorConnections.sources.map((source,index)=>`<div class="connection-row"><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title||new URL(source.url).hostname)}${source.position?` · ${escape(source.position)}`:''}</a><button type="button" data-connection-kind="sources" data-remove-connection="${index}" aria-label="移除來源">移除</button></div>`).join('');
  }
  function refresh() {
    const owner=state.currentUser?.id||'';
    if(owner!==activeOwner){activeOwner=owner;api.clearNoteForm({clearDraft:false});loadedNoteId=null;reviewSignature='';}
    const current=state.notes.find(note=>note.id===els.noteId.value);
    if(loadedNoteId!==(els.noteId.value||''))loadConnections(current||{});
    refreshEditorStatus();
    const pending=api.pendingCount();
    menu.querySelector('[data-workspace-pending]').innerHTML=pending?`<p class="workspace-offline-help">其他裝置已有變更時，可將離線內容另存一則，再同步。</p>${api.pendingNotes().map(item=>`<div class="connection-row"><span>${escape(item.note.title)}</span><button type="button" data-pending-copy="${escape(item.note.id)}">另存一則</button></div>`).join('')}`:'';
    menu.querySelector('[data-workspace-sync]').textContent=pending?`${pending} 篇離線札記尚待同步`:state.supabase?state.syncStatus:'此裝置保存';
    menu.querySelector('[data-workspace-sync-pending]').disabled=!state.supabase||!navigator.onLine;
    const signature=JSON.stringify({notes:state.notes.map(note=>[note.id,note.updated_at,note.title,note.status]),books:state.books.map(book=>[book.id,book.updated_at,book.title,book.author_name])});
    if(signature===reviewSignature)return;reviewSignature=signature;
    const notes=[...state.notes].sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at)));
    const lead=notes.find(note=>note.status==='draft')||notes[0];
    const published=notes.filter(note=>note.status!=='draft').slice(0,4);
    const book=[...state.books].sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at)))[0];
    const fullDate=new Intl.DateTimeFormat('zh-TW',{month:'long',day:'numeric',weekday:'long'}).format(new Date());
    review.innerHTML = `
      <section class="folio-opening" aria-labelledby="folio-note-title">
        <div class="folio-opening-scene">
          <div class="folio-opening-copy">
            <p class="folio-date">${escape(fullDate)}</p>
            <p class="review-lead-meta">${lead ? (lead.status === 'draft' ? '草稿' : '最近編輯的札記') : ''}</p>
            <h1 id="folio-note-title" class="${(lead?.title || '').length > 32 ? 'folio-title-long' : ''}">${lead ? editorialTitle(lead.title || '未命名札記') : '新增札記'}</h1>
            ${lead ? `<p class="folio-lead-excerpt">${escape(api.getPreview(lead, 100).replace(/(?:^|\s)#{1,6}\s+/g, ' '))}</p>` : ''}
            <button class="folio-text-action folio-primary-action" type="button" ${lead ? `data-resume-note="${escape(lead.id)}"` : 'data-review-new'}>${lead ? '繼續編輯' : '寫札記'}</button>
          </div>
          <figure class="folio-portrait" aria-hidden="true"><img src="./assets/editorial/coast-study.jpg" width="1280" height="853" alt="" fetchpriority="high" decoding="async"></figure>
          <section class="folio-reading" aria-labelledby="folio-reading-title">
            <div class="folio-reading-header">
              <h2 id="folio-reading-title">麥琴讀經進度</h2>
              <button type="button" class="folio-text-action" data-review-shelf>選擇日期</button>
            </div>
            <p class="folio-reading-date" data-review-reading-date></p>
            <div data-review-reading-list></div>
          </section>
        </div>
      </section>
      <section class="folio-journal" data-editorial-section aria-labelledby="folio-journal-title">
        <header class="folio-section-heading">
          <h2 id="folio-journal-title">近期札記</h2>
          <button type="button" class="folio-text-action" data-review-view="note-reader">查看全部札記</button>
        </header>
        <div class="review-entries">${published.length ? published.map(note => `
          <article class="folio-entry">
            <p class="review-entry-meta"><time>${escape(dateLabel(note.created_at))}</time>${note.scripture_reference ? `<span>${escape(note.scripture_reference)}</span>` : ''}</p>
            <h3><button type="button" data-review-note="${escape(note.id)}">${escape(note.title || '未命名札記')}</button></h3>
            <p class="folio-entry-excerpt">${escape(api.getPreview(note, 165).replace(/(?:^|\s)#{1,6}\s+/g, ' '))}</p>
          </article>`).join('') : '<p class="folio-journal-empty">還沒有已儲存的札記。</p>'}
        </div>
      </section>
      <section class="folio-bookroom" data-editorial-section aria-labelledby="folio-bookroom-title">
        <h2 id="folio-bookroom-title">書稿</h2>
        <div class="folio-book-copy">
          ${book ? `<h3>${escape(book.title)}</h3>${book.author_name ? `<p>${escape(book.author_name)}</p>` : ''}` : ''}
          <button class="folio-text-action" type="button" ${book ? `data-review-book="${escape(book.id)}"` : 'data-review-view="books"'}>${book ? '接續編排' : '建立書稿'}</button>
          <button class="folio-text-action" type="button" data-review-view="library">開啟電子書櫃</button>
        </div>
      </section>`;
    review.querySelector('[data-review-shelf]').addEventListener('click', openShelf);
    renderReadingLinks();motion.refresh();
  }
  function renderReadingLinks(){
    const list=review.querySelector('[data-review-reading-list]');if(!list)return;
    const refs=[...document.querySelectorAll('#today-reading-list [data-today-reading-index]')];
    const next = refs.length ? ['家庭讀經', '個人讀經'].map((label, group) => `
      <div class="folio-reading-group">
        <h3>${label}</h3>
        ${refs.slice(group * 2, group * 2 + 2).map((ref, offset) => {
          const name = escape(ref.querySelector('strong')?.textContent || '經文');
          return `<button type="button" data-review-reading="${group * 2 + offset}" aria-label="閱讀 ${name}">${name}</button>`;
        }).join('')}
      </div>`).join('') : `<p>${escape(document.getElementById('today-reading-list')?.textContent?.trim() || '經文載入中')}</p>`;
    if (list.innerHTML !== next) list.innerHTML = next;
    const date = review.querySelector('[data-review-reading-date]');
    const selectedDate = document.getElementById('today-reading-label')?.textContent || '';
    date.textContent = refs.length ? selectedDate : '';
  }

  function resume() {
    if(!state.currentUser)return;
    const draft=api.getCurrentDraft();
    if(draft&&draft.userId===state.currentUser.id&&draft.content){api.setView('notes');api.restoreDraft();loadConnections(draft);return;}
    api.setView('dashboard');
    refresh();
  }
  return {refresh,resume,refreshEditorStatus,closePanel:motion.closePanel,cancelPanelClose:motion.cancelPanelClose,loadConnections,getConnections:()=>normalizeNoteConnections(editorConnections),renderConnections(note){
    const connections=normalizeNoteConnections(note);
    const backwards=state.notes.filter(item=>item.id!==note.id&&normalizeNoteConnections(item).related_notes.includes(note.id)&&item.status!=='draft');
    const ids=[...new Set([...connections.related_notes,...backwards.map(item=>item.id)])];
    const related=ids.map(id=>state.notes.find(item=>item.id===id&&item.status!=='draft')).filter(Boolean);
    const unavailable=connections.related_notes.filter(id=>!related.some(item=>item.id===id));
    return `${related.length||unavailable.length?`<section class="note-connections-reading"><h3>關聯札記</h3>${related.map(item=>`<button type="button" data-open-related-note="${escape(item.id)}">${escape(item.title)}</button>`).join('')}${unavailable.map(id=>{const draft=state.notes.find(item=>item.id===id);return `<p>${draft?`${escape(draft.title||'關聯札記')}仍為草稿。`:'一篇關聯札記已移除。'}</p>`;}).join('')}</section>`:''}${connections.sources.length?`<section class="note-connections-reading"><h3>引用來源</h3>${connections.sources.map(source=>`<p><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title||new URL(source.url).hostname)}</a>${source.position?` · ${escape(source.position)}`:''}</p>`).join('')}</section>`:''}`;
  }};
}


function createEditorialMotion(review,header){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const closing=new WeakMap();
  let scheduled=0,lastView=document.body.dataset.currentView,visiblePanels=new Set();
  const clamp=value=>Math.max(0,Math.min(1,value));
  const panelFor=element=>element?.matches('dialog,.book-draft-modal-shell')?element:element?.querySelector('.modal-card');
  function animate(element,frames,options={}){
    if(!element||reduced.matches||document.hidden)return null;
    return element.animate(frames,{duration:520,easing:'cubic-bezier(.22,.8,.22,1)',...options});
  }
  function draw(){
    scheduled=0;
    if(document.hidden||document.body.dataset.currentView!=='dashboard')return;
    const opening=review.querySelector('.folio-opening');
    if(opening){
      const rect=opening.getBoundingClientRect();
      const progress=reduced.matches?0:clamp((header.clientHeight-rect.top)/Math.max(1,rect.height*.85));
      opening.style.setProperty('--journey',progress.toFixed(4));
      opening.dataset.motionProgress=progress.toFixed(2);
    }
    for(const section of review.querySelectorAll('[data-editorial-section]')){
      const rect=section.getBoundingClientRect();
      const progress = reduced.matches ? 1 : clamp((innerHeight - rect.top) / Math.min(rect.height, innerHeight * .56));
      section.style.setProperty('--section-journey',progress.toFixed(4));
      section.dataset.motionProgress = progress.toFixed(2);
    }
  }
  function schedule(){if(!scheduled)scheduled=requestAnimationFrame(draw);}
  function cancelPanelClose(element){const pending=closing.get(element);if(pending){pending.cancel();closing.delete(element);}}
  function closePanel(element,finish){
    if(!element||element.classList.contains('hidden')){finish();return;}
    if(closing.has(element))return;
    const panel=panelFor(element);
    const animation=animate(panel,[{opacity:1},{opacity:0}],{duration:180,easing:'cubic-bezier(.4,0,1,1)'});
    if(!animation){finish();return;}
    closing.set(element,animation);
    animation.finished.then(()=>{if(closing.get(element)===animation){closing.delete(element);finish();}},()=>{});
  }
  const resize=new ResizeObserver(()=>{document.documentElement.style.setProperty('--devotion-header-height',`${Math.round(header.getBoundingClientRect().height)}px`);schedule();});resize.observe(header);
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&scheduled){cancelAnimationFrame(scheduled);scheduled=0;}else schedule();});
  new MutationObserver(()=>{
    const view=document.body.dataset.currentView;
    if(view!==lastView){
      const section=document.getElementById(`view-${view}`);
      if (view !== 'notes' && view !== 'dashboard') animate(section,[{opacity:.72},{opacity:1}],{duration:240});
      lastView=view;
    }
    const panels=new Set([...document.querySelectorAll('dialog[open],.modal:not(.hidden),.book-draft-modal-shell.is-open')].filter(el=>el.getClientRects().length));
    for(const element of panels)if(!visiblePanels.has(element)){
      cancelPanelClose(element);
      const panel=panelFor(element);
      const readingPanel = element.matches('#today-reading-dialog,#note-reader-reading-modal,#workspace-reading-shelf');
      animate(panel,[{opacity:.55},{opacity:1}],{duration:readingPanel ? 380 : 220});
      if (readingPanel) {
        const backdrop = element.querySelector('.modal-backdrop');
        animate(backdrop,[{opacity:0},{opacity:1}],{duration:290});
        animate(panel?.querySelector('h2'),[
          {clipPath:'inset(0 100% 0 0)', transform:'translateX(10px)'},
          {clipPath:'inset(0)', transform:'translateX(0)'},
        ],{duration:350});
      }
    }
    visiblePanels=panels;schedule();
  }).observe(document.body,{subtree:true,attributes:true,attributeFilter:['data-current-view','class','open']});
  reduced.addEventListener('change',schedule);
  return {refresh:schedule,closePanel,cancelPanelClose};
}

// Existing modal views keep keyboard focus inside the active dialog.
function manageEditorialDialogFocus(){
  let lastAction=null;let previous=[];const origins=new WeakMap();
  const visible=element=>element?.isConnected&&element.getClientRects().length>0;
  document.addEventListener('click',event=>{lastAction=event.target.closest('button,a,input,select,textarea,summary')||lastAction;},true);
  const dialogs=()=>[...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].filter(visible);
  new MutationObserver(()=>{
    const current=dialogs();
    for(const dialog of current)if(!previous.includes(dialog)){origins.set(dialog,lastAction||document.activeElement);if(!dialog.contains(document.activeElement))dialog.querySelector('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])')?.focus();}
    for(const dialog of previous)if(!current.includes(dialog)&&!current.length){
      const origin=origins.get(dialog);
      const fallback=document.querySelector('.devotion-masthead [data-workspace-view="note-reader"]');
      if(!document.querySelector('dialog[open]')&&(dialog.contains(document.activeElement)||document.activeElement===document.body||!visible(document.activeElement))){
        if(visible(origin))origin.focus({preventScroll:true});else if(visible(fallback))fallback.focus({preventScroll:true});
      }
    }
    previous=current;
  }).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','aria-hidden']});
  document.addEventListener('keydown',event=>{
    if(event.key!=='Tab'||document.querySelector('dialog[open]'))return;
    const dialog=dialogs().at(-1);if(!dialog)return;
    const controls=[...dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),summary')].filter(visible);
    if(!controls.length)return;
    const first=controls[0],last=controls.at(-1);
    if(!dialog.contains(document.activeElement)){event.preventDefault();first.focus();}
    else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  },true);
}
