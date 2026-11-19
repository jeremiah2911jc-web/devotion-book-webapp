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
  const menuGroups = [
    { title: '札記', items: [['dashboard', '首頁'], ['notes', '寫札記'], ['note-reader', '找札記'], ['prayer', '禱告紀錄']] },
    { title: '書稿與書櫃', items: [['content-library', '選取札記'], ['books', '選稿編排'], ['library', '電子書櫃']] },
  ];
  menu.innerHTML = `<div class="workspace-dialog-heading"><h2>選單</h2><button type="button" data-workspace-close>關閉</button></div>
    <nav class="workspace-menu-groups" aria-label="全部操作">
      ${menuGroups.map(({ title, items }) => `<section class="workspace-menu-group">
        <h3>${title}</h3>
        ${items.map(([view, label]) => `<button type="button" data-workspace-view="${view}">${label}</button>`).join('')}
      </section>`).join('')}
    </nav>
    <div class="workspace-menu-account">
      <div class="workspace-menu-utilities">
        <button type="button" data-workspace-account>帳號設定</button>
        <button type="button" data-workspace-view="manual">操作手冊</button>
      </div>
      <div class="workspace-menu-utilities">
        <button type="button" data-workspace-sync-pending>同步</button>
        <button type="button" data-workspace-signout>登出</button>
      </div>
    </div>
    <p class="workspace-menu-status" data-workspace-sync role="status"></p>
    <div data-workspace-pending></div>
    <p class="workspace-offline-help">離線可編輯已載入的札記。禱告、編書及書櫃的雲端功能需連線。</p>`;
  const footerContent = root.querySelector('.site-footer-content');
  if (footerContent) {
    const siteInfo = document.createElement('details');
    siteInfo.className = 'workspace-menu-site-info';
    siteInfo.innerHTML = '<summary>聯絡與版權<span aria-hidden="true">＋</span></summary>';
    siteInfo.append(footerContent.cloneNode(true));
    siteInfo.insertAdjacentHTML('beforeend', '<p class="workspace-menu-status" data-feedback-copy-status role="status"></p>');
    menu.append(siteInfo);
  }
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
  const menuTrigger = masthead.querySelector('[data-workspace-menu]');
  menuTrigger.addEventListener('click', () => {
    menu.showModal();
    menuTrigger.setAttribute('aria-expanded', 'true');
  });
  const closeMenu = () => {
    menu.close();
    menuTrigger.setAttribute('aria-expanded', 'false');
    menuTrigger.focus({ preventScroll: true });
  };
  menu.querySelector('[data-workspace-close]').addEventListener('click', closeMenu);
  menu.addEventListener('close', () => menuTrigger.setAttribute('aria-expanded', 'false'));
  menu.addEventListener('cancel', event => {
    event.preventDefault();
    closeMenu();
  });
  menu.querySelector('[data-workspace-account]').addEventListener('click',()=>{closeMenu();api.openAccountSettings();});
  menu.querySelector('[data-workspace-sync-pending]').addEventListener('click',()=>api.syncPending());
  menu.querySelector('[data-workspace-pending]').addEventListener('click',event=>{const button=event.target.closest('[data-pending-copy]');if(button)api.copyPending(button.dataset.pendingCopy).catch(api.onError);});
  menu.querySelector('[data-workspace-signout]').addEventListener('click',()=>{closeMenu();api.signOut().catch(api.onError);});
  document.querySelectorAll('[data-workspace-view]').forEach(button => button.addEventListener('click',()=>{if(menu.open)closeMenu();api.setView(button.dataset.workspaceView);}));
  masthead.querySelector('[data-workspace-new]').addEventListener('click',async()=>{if(!await api.prepareNewNote())return;api.clearNoteForm({clearDraft:true});api.setView('notes');els.noteContent.focus();});
  masthead.querySelector('[data-workspace-reading]').addEventListener('click', openShelf);
  shelf.querySelector('[data-shelf-close]').addEventListener('click',()=>shelf.close());
  shelf.addEventListener('click',event=>{if(event.target.closest('[data-today-reading-index], #today-reading-note-btn'))shelf.close();});
  menu.addEventListener('click', event => { if (event.target === menu) closeMenu(); });
  shelf.addEventListener('click', event => { if (event.target === shelf) shelf.close(); });

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

  let openEditorMenu;
  const closeEditorMenu = () => {
    if (!openEditorMenu) return;
    const panel = document.getElementById(openEditorMenu.getAttribute('aria-controls'));
    const restoreFocus = panel.contains(document.activeElement);
    openEditorMenu.setAttribute('aria-expanded', 'false');
    if (restoreFocus) openEditorMenu.focus({preventScroll: true});
    openEditorMenu = null;
  };
  document.addEventListener('click', event => {
    const toggle = event.target instanceof Element && event.target.closest('.note-editor-menu-toggle');
    const openNext = toggle && form.contains(toggle) && toggle !== openEditorMenu;
    closeEditorMenu();
    if (openNext) {
      openEditorMenu = toggle;
      toggle.setAttribute('aria-expanded', 'true');
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && openEditorMenu) closeEditorMenu();
  });
  form.querySelector('.markdown-toolbar').addEventListener('pointerdown', event => {
    if (document.activeElement === els.noteContent && event.target instanceof Element && event.target.closest('button')) {
      event.preventDefault();
    }
  });
  const writingMode = createMobileWritingMode({
    surface: writingSurface, textarea: els.noteContent, scriptureInput: els.noteScripture,
    scripture, tools, saveButton: els.publishNoteBtn, dateline: top,
    persistDraft: api.persistDraft, closeEditorMenu,
  });

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
    if(owner!==activeOwner){writingMode.close({restoreFocus:false, saveDraft:false});activeOwner=owner;api.clearNoteForm({clearDraft:false});loadedNoteId=null;reviewSignature='';}
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
          <figure class="folio-portrait" aria-hidden="true"><img src="./assets/editorial/rocky-surf.jpg" width="1600" height="900" alt="" fetchpriority="high" decoding="async"></figure>
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

  return {refresh,refreshEditorStatus,closeWritingMode:writingMode.close,closePanel:motion.closePanel,cancelPanelClose:motion.cancelPanelClose,turnPage:motion.turnPage,loadConnections,getConnections:()=>normalizeNoteConnections(editorConnections),renderConnections(note){
    const connections=normalizeNoteConnections(note);
    const backwards=state.notes.filter(item=>item.id!==note.id&&normalizeNoteConnections(item).related_notes.includes(note.id)&&item.status!=='draft');
    const ids=[...new Set([...connections.related_notes,...backwards.map(item=>item.id)])];
    const related=ids.map(id=>state.notes.find(item=>item.id===id&&item.status!=='draft')).filter(Boolean);
    const unavailable=connections.related_notes.filter(id=>!related.some(item=>item.id===id));
    return `${related.length||unavailable.length?`<section class="note-connections-reading"><h3>關聯札記</h3>${related.map(item=>`<button type="button" data-open-related-note="${escape(item.id)}">${escape(item.title)}</button>`).join('')}${unavailable.map(id=>{const draft=state.notes.find(item=>item.id===id);return `<p>${draft?`${escape(draft.title||'關聯札記')}仍為草稿。`:'一篇關聯札記已移除。'}</p>`;}).join('')}</section>`:''}${connections.sources.length?`<section class="note-connections-reading"><h3>引用來源</h3>${connections.sources.map(source=>`<p><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title||new URL(source.url).hostname)}</a>${source.position?` · ${escape(source.position)}`:''}</p>`).join('')}</section>`:''}`;
  }};
}

function createMobileWritingMode({surface, textarea, scriptureInput, scripture, tools, saveButton, dateline, persistDraft, closeEditorMenu}) {
  const editor = textarea.closest('.note-content-section');
  const toolbar = editor.querySelector('.markdown-toolbar');
  const saveActions = saveButton.parentElement;
  const scriptureHome = scripture.parentElement;
  const appShell = surface.closest('.app-shell');
  const status = dateline.querySelector('#workspace-writing-status');
  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'writing-expand-button';
  launcher.textContent = '全螢幕編輯';
  launcher.setAttribute('aria-haspopup', 'dialog');
  dateline.append(launcher);

  const heading = document.createElement('header');
  heading.className = 'writing-focus-heading';
  heading.hidden = true;
  heading.innerHTML = '<button type="button" class="ghost-btn">返回</button><h2 id="writing-focus-title" class="visually-hidden">全螢幕編輯札記</h2>';
  const backButton = heading.querySelector('button');
  surface.prepend(heading);

  const referenceButton = document.createElement('button');
  referenceButton.type = 'button';
  referenceButton.className = 'ghost-btn writing-focus-lookup';
  referenceButton.textContent = '查經';
  referenceButton.hidden = true;
  referenceButton.setAttribute('aria-controls', 'writing-focus-reference');
  referenceButton.setAttribute('aria-expanded', 'false');
  toolbar.append(referenceButton);

  const reference = document.createElement('div');
  reference.id = 'writing-focus-reference';
  reference.className = 'writing-focus-reference writing-reference';
  reference.hidden = true;
  reference.innerHTML = '<button type="button" class="ghost-btn">返回正文</button>';
  const returnToText = reference.querySelector('button');
  editor.append(reference);

  const viewport = window.visualViewport;
  const background = [];
  let expanded = false;
  let frame = 0;
  let pageScrollY = 0;

  function updateViewport() {
    frame = 0;
    const height = viewport?.height ?? window.innerHeight;
    const top = Math.max(0, viewport?.offsetTop ?? 0);
    document.body.style.setProperty('--writing-viewport-height', `${height}px`);
    document.body.style.setProperty('--writing-viewport-top', `${top}px`);
    surface.classList.toggle('writing-focus-compact', height < 425);
  }

  function scheduleViewport() {
    if (expanded && !frame) frame = requestAnimationFrame(updateViewport);
  }

  function closeReference(restoreFocus = false) {
    reference.hidden = true;
    referenceButton.setAttribute('aria-expanded', 'false');
    if (restoreFocus) textarea.focus({preventScroll:true});
  }

  function open() {
    if (expanded) return;
    closeEditorMenu();
    const scrollTop = textarea.scrollTop;
    pageScrollY = window.scrollY;
    expanded = true;
    document.body.classList.add('writing-expanded');
    surface.setAttribute('role', 'dialog');
    surface.setAttribute('aria-modal', 'true');
    surface.setAttribute('aria-labelledby', 'writing-focus-title');
    // Keep the existing form, inputs and save handler. Only their presentation changes.
    heading.append(status, saveButton);
    reference.append(scripture);
    heading.hidden = false;
    referenceButton.hidden = false;
    tools.hidden = true;
    for (let branch = surface; branch !== appShell; branch = branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling === branch || sibling.inert) continue;
        sibling.inert = true;
        background.push(sibling);
      }
    }
    updateViewport();
    textarea.scrollTop = scrollTop;
    backButton.focus({preventScroll:true});
  }

  function close({restoreFocus = true, saveDraft = true} = {}) {
    if (!expanded) return;
    const scrollTop = textarea.scrollTop;
    if (saveDraft) persistDraft();
    expanded = false;
    cancelAnimationFrame(frame);
    frame = 0;
    closeEditorMenu();
    closeReference();
    heading.hidden = true;
    referenceButton.hidden = true;
    tools.hidden = false;
    saveActions.prepend(saveButton);
    dateline.insertBefore(status, launcher);
    scriptureHome.prepend(scripture);
    for (const element of background.splice(0)) element.inert = false;
    surface.removeAttribute('role');
    surface.removeAttribute('aria-modal');
    surface.setAttribute('aria-labelledby', 'note-content-section-title');
    surface.classList.remove('writing-focus-compact');
    document.body.classList.remove('writing-expanded');
    document.body.style.removeProperty('--writing-viewport-height');
    document.body.style.removeProperty('--writing-viewport-top');
    textarea.scrollTop = scrollTop;
    window.scrollTo({top: pageScrollY, behavior: 'instant'});
    if (restoreFocus) launcher.focus({preventScroll:true});
  }

  launcher.addEventListener('click', open);
  backButton.addEventListener('click', () => close());
  referenceButton.addEventListener('click', () => {
    if (!reference.hidden) {
      closeReference(true);
      return;
    }
    reference.hidden = false;
    referenceButton.setAttribute('aria-expanded', 'true');
    returnToText.focus({preventScroll:true});
  });
  returnToText.addEventListener('click', () => closeReference(true));
  scriptureInput.addEventListener('keydown', event => {
    if (!expanded || event.key !== 'Enter' || event.isComposing) return;
    event.preventDefault();
    scripture.querySelector('#fetch-scripture-btn').click();
  });
  textarea.addEventListener('focus', () => { if (expanded && !reference.hidden) closeReference(); });
  document.addEventListener('keydown', event => {
    if (!expanded || event.key !== 'Escape' || event.isComposing || event.defaultPrevented) return;
    if (document.querySelector('dialog[open], .modal:not(.hidden)')) return;
    if (toolbar.querySelector('[aria-expanded="true"]:not(.writing-focus-lookup)')) return;
    event.preventDefault();
    if (!reference.hidden) closeReference(true);
    else close();
  }, true);
  viewport?.addEventListener('resize', scheduleViewport);
  viewport?.addEventListener('scroll', scheduleViewport);
  window.addEventListener('resize', scheduleViewport);

  return {close};
}


function createEditorialMotion(review,header){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const closing=new WeakMap();
  const entrances = new WeakMap();
  const welcome = document.querySelector('.auth-gate-body');
  const gate = welcome?.closest('#auth-gate');
  let scheduled=0,lastView=document.body.dataset.currentView,visiblePanels=new Set();
  const clamp=value=>Math.max(0,Math.min(1,value));
  const panelFor=element=>element?.matches('dialog,.book-draft-modal-shell')?element:element?.querySelector('.modal-card');
  function animate(element,frames,options={}){
    if(!element||reduced.matches||document.hidden)return null;
    return element.animate(frames,{duration:520,easing:'cubic-bezier(.22,.8,.22,1)',...options});
  }
  function animateEntrance(element, frames, options) {
    if (!element) return;
    entrances.get(element)?.cancel();
    const animation = animate(element, frames, options);
    if (animation) {
      entrances.set(element, animation);
      animation.finished.then(() => {
        if (entrances.get(element) === animation) entrances.delete(element);
      }, () => {});
    }
  }
  const motionFrames = {
    leading: [{ transform: 'translateX(-13px)', opacity: .65 }, { transform: 'none', opacity: 1 }],
    rising: [{ transform: 'translateY(11px)', opacity: .72 }, { transform: 'none', opacity: 1 }],
    gathering: [{ transform: 'translateX(13px)', opacity: .67 }, { transform: 'none', opacity: 1 }],
    reading: [{ opacity: .78 }, { opacity: 1 }],
    cover: [{ transform: 'scale(1.09)' }, { transform: 'none' }],
  };
  const viewEntrances = {
    dashboard: [['.folio-portrait img', 'cover', 460]],
    notes: [['.workspace-page-heading h1', 'leading', 300]],
    prayer: [['.workspace-page-heading h1', 'rising', 340], ['.prayer-workspace', 'reading', 330, 55]],
    'note-reader': [['#note-reader-search-title', 'leading', 340], ['.note-reader-shell', 'reading', 360, 65]],
    'content-library': [['.workspace-page-heading h1', 'gathering', 360], ['#content-library-book-hint', 'reading', 320, 55]],
    books: [['.workspace-page-heading h1', 'gathering', 380], ['#books-list', 'reading', 320, 85]],
    library: [['.workspace-page-heading h1', 'rising', 380], ['#library-list .library-cover', 'cover', 420, 75], ['#library-list', 'reading', 400, 45]],
    reader: [['#reader-content', 'reading', 420]],
    manual: [['.manual-hero h1', 'leading', 340], ['.manual-toc', 'reading', 380, 65]],
    'admin-dashboard': [['.admin-dashboard-panel h2', 'leading', 300], ['#admin-summary-cards', 'reading', 350, 65]],
  };
  function openView(view) {
    const section = document.getElementById(`view-${view}`);
    for (const [selector, effect, duration, delay = 0] of viewEntrances[view] || []) {
      animateEntrance(section?.querySelector(selector), motionFrames[effect], { duration, delay, fill: 'backwards' });
    }
  }
  function turnPage(direction) {
    const page = document.getElementById('reader-content');
    const edge = direction > 0 ? 'inset(0 0 0 5%)' : 'inset(0 5% 0 0)';
    animateEntrance(page, [{ clipPath: edge, opacity: .72 }, { clipPath: 'inset(0)', opacity: 1 }], { duration: 230 });
  }
  function openPanel(element) {
    cancelPanelClose(element);
    const panel = panelFor(element);
    const readingPanel = element.matches('#today-reading-dialog,#note-reader-reading-modal,#workspace-reading-shelf');
    const menuPanel = element.matches('#workspace-menu');
    const bookPanel = element.matches('.book-draft-modal-shell,#book-draft-settings-modal,#book-export-settings-modal');
    const heading = panel?.querySelector('h2,h3');
    const backdrop = element.querySelector('.modal-backdrop');
    animateEntrance(panel, [{ opacity: .62 }, { opacity: 1 }], { duration: readingPanel ? 380 : 260 });
    animateEntrance(backdrop, [{ opacity: .2 }, { opacity: 1 }], { duration: 280 });
    const effect = readingPanel || bookPanel ? 'gathering' : 'rising';
    animateEntrance(heading, motionFrames[effect], { duration: 355 });
    if (menuPanel) {
      const headings = panel.querySelectorAll('.workspace-menu-group h3');
      for (const [index, title] of [...headings].entries()) {
        animateEntrance(title, motionFrames[index === 0 ? 'leading' : 'gathering'], { duration: 320, delay: index * 55, fill: 'backwards' });
      }
    }
  }
  function draw(){
    scheduled=0;
    if (document.hidden) return;
    if (gate && !gate.classList.contains('hidden')) {
      const traveled = reduced.matches ? 0 : Math.min(scrollY, 320);
      welcome.style.setProperty('--welcome-scroll', `${traveled}px`);
      return;
    }
    if (document.body.dataset.currentView !== 'dashboard') return;
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
    if (view !== lastView) {
      openView(view);
      lastView = view;
    }
    const panels = new Set([...document.querySelectorAll('dialog[open],.modal:not(.hidden),.book-draft-modal-shell.is-open')].filter(el => el.getClientRects().length));
    for (const element of panels) if (!visiblePanels.has(element)) openPanel(element);
    visiblePanels=panels;schedule();
  }).observe(document.body,{subtree:true,attributes:true,attributeFilter:['data-current-view','class','open']});
  reduced.addEventListener('change',schedule);
  return {refresh:schedule,closePanel,cancelPanelClose,turnPage};
}

// Existing modal views keep keyboard focus inside the active dialog.
function manageEditorialDialogFocus(){
  let lastAction=null;let previous=[];const origins=new WeakMap();
  const visible=element=>element?.isConnected&&!element.closest('[inert]')&&element.getClientRects().length>0;
  document.addEventListener('click',event=>{lastAction=event.target.closest('button,a,input,select,textarea,summary')||lastAction;},true);
  const dialogs=()=>[...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].filter(visible);
  new MutationObserver(()=>{
    const current=dialogs();
    for(const dialog of current)if(!previous.includes(dialog)){origins.set(dialog,lastAction||document.activeElement);if(!dialog.contains(document.activeElement))dialog.querySelector('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])')?.focus();}
    const writingDialog = current.at(-1)?.matches('.note-main-writing') ? current.at(-1) : null;
    for(const dialog of previous)if(!current.includes(dialog)&&(!current.length||writingDialog)){
      const origin=origins.get(dialog);
      const fallback=writingDialog?.querySelector('#writing-focus-reference:not([hidden]) button')
        || writingDialog?.querySelector('.writing-focus-heading button')
        || document.querySelector('.devotion-masthead [data-workspace-view="note-reader"]');
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
