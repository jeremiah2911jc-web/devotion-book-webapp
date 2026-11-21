import { dailyReadingMonth, dailyReadings } from './daily-readings.js';
import { getScriptureBookAliasSummary } from './scripture-reference-utils.js';

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
  const date = value.daily_reflection_date;
  return {
    ...(typeof date === 'string' && /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date)
      ? { daily_reflection_date: date } : {}),
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
    <nav aria-label="常用操作"><button type="button" data-workspace-reading aria-haspopup="dialog" aria-controls="workspace-reading-shelf">讀經</button><button type="button" data-workspace-view="note-reader">找札記</button><button type="button" data-workspace-new class="masthead-write">寫札記</button><button type="button" data-workspace-menu aria-expanded="false" aria-controls="workspace-menu">選單</button></nav>`;
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
  shelf.setAttribute('aria-labelledby', 'workspace-reading-title');
  const { year, month } = dailyReadingMonth;
  const readingsByDay = new Map(dailyReadings.map(reading => [reading.day, reading]));
  const dateForDay = day => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const readingsByDate = new Map(dailyReadings.map(reading => [dateForDay(reading.day), reading]));
  const noteReflectionDate = note => {
    if (note.daily_reflection_date) return note.daily_reflection_date;
    if (!note.scripture_reference && !note.scripture) return undefined;
    const reading = dailyReadings.find(item => note.title === `${item.reference} 的靈修默想`);
    return reading ? dateForDay(reading.day) : undefined;
  };
  const monthStart = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const calendarDays = '<span aria-hidden="true"></span>'.repeat(monthStart.getDay()) +
    Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const reading = readingsByDay.get(day);
      return reading
        ? `<button type="button" class="note-calendar-day daily-calendar-day" data-daily-day="${day}" aria-pressed="false" aria-label="${month} 月 ${day} 日，${escape(reading.reference)}">${day}</button>`
        : `<span class="daily-calendar-empty" aria-hidden="true">${day}</span>`;
    }).join('');
  shelf.innerHTML = `<header class="workspace-reading-hero">
    <div class="workspace-reading-art" aria-hidden="true"></div>
    <div class="workspace-dialog-heading">
      <h2 id="workspace-reading-title" tabindex="-1" autofocus>讀經</h2>
      <div class="workspace-reading-header-actions">
        <button type="button" class="hidden" data-reading-choices-back>讀經選項</button>
        <button type="button" data-shelf-close>關閉</button>
      </div>
    </div>
  </header>
  <div class="workspace-reading-destinations" data-reading-destinations>
    <button type="button" data-reading-daily aria-labelledby="reading-choice-daily" aria-describedby="reading-choice-daily-details">
      <span id="reading-choice-daily">每日默想</span>
      <small id="reading-choice-daily-details">讀當日經文與釋經，寫下心得</small>
    </button>
    <button type="button" data-reading-plan aria-labelledby="reading-choice-plan" aria-describedby="reading-choice-plan-details">
      <span id="reading-choice-plan">麥琴讀經</span>
      <small id="reading-choice-plan-details">查看每日的家庭與個人讀經進度</small>
    </button>
    <button type="button" data-reading-bible aria-labelledby="reading-choice-bible" aria-describedby="reading-choice-bible-details">
      <span id="reading-choice-bible">整本聖經</span>
      <small id="reading-choice-bible-details">開啟內建和合本</small>
    </button>
    <p role="status" data-reading-bible-status></p>
  </div>
  <div class="daily-reading hidden" data-daily-reading-view>
    <article class="daily-reading-content" aria-labelledby="daily-reading-theme">
      <div class="daily-reading-intro">
        <details class="daily-calendar" open>
          <summary><span>靈修月曆</span><span id="daily-calendar-month">${year} 年 ${month} 月</span></summary>
          <div class="note-calendar-weekdays" aria-hidden="true">
            ${['日', '一', '二', '三', '四', '五', '六'].map(day => `<span>${day}</span>`).join('')}
          </div>
          <div class="note-calendar-days" role="group" aria-labelledby="daily-calendar-month">${calendarDays}</div>
        </details>
        <header class="daily-reading-heading">
          <p data-daily-date></p>
          <h3 id="daily-reading-theme" tabindex="-1"></h3>
          <p data-daily-reference></p>
        </header>
      </div>
      <div class="daily-reading-columns">
        <section aria-labelledby="daily-passage-heading">
          <div class="daily-passage-heading">
            <h4 id="daily-passage-heading">經文</h4>
            <span>網站內建和合本</span>
          </div>
          <details class="daily-verse-picker hidden" data-daily-verse-picker>
            <summary>選擇經節<span data-daily-verse-count role="status">整段經文</span></summary>
            <div data-daily-verse-options></div>
            <button type="button" class="ghost-btn hidden" data-daily-use-full>使用整段</button>
          </details>
          <div data-daily-passage></div>
          <p data-daily-passage-status role="status"></p>
          <button class="ghost-btn hidden" type="button" data-daily-retry>重新載入經文</button>
        </section>
        <aside class="daily-reading-summary" aria-labelledby="daily-summary-heading">
          <h4 id="daily-summary-heading">今日經文摘要</h4>
          <p data-daily-summary></p>
        </aside>
      </div>
      <section class="daily-reading-explanation" aria-labelledby="daily-explanation-heading">
        <h4 id="daily-explanation-heading">經文解釋</h4>
        <div data-daily-explanation></div>
      </section>
      <section class="daily-reading-response hidden" aria-labelledby="daily-response-heading">
        <h4 id="daily-response-heading">默想與回應</h4>
        <p class="daily-response-reference" data-daily-response-reference></p>
        <div data-daily-response-text></div>
      </section>
    </article>
    <div class="daily-reading-actions">
      <button type="button" class="ghost-btn" data-daily-reference-only disabled>只帶入經文出處</button>
      <button type="button" class="primary-btn" data-daily-reflect disabled>默想感動</button>
    </div>
  </div>`;
  const today = document.querySelector('.home-today-reading-card');
  const todayHeader = today?.querySelector('.today-reading-header');
  if (today) {
    shelf.querySelector('.workspace-reading-hero').append(todayHeader);
    shelf.append(today);
  }
  document.body.append(shelf);
  const readingHeading = shelf.querySelector('#workspace-reading-title');
  const destinations = shelf.querySelector('[data-reading-destinations]');
  const backToChoices = shelf.querySelector('[data-reading-choices-back]');
  const dailyButton = shelf.querySelector('[data-reading-daily]');
  const dailyView = shelf.querySelector('[data-daily-reading-view]');
  const dailyCalendar = dailyView.querySelector('.daily-calendar');
  const dailyContent = dailyView.querySelector('.daily-reading-content');
  const dailyTheme = dailyView.querySelector('#daily-reading-theme');
  const dailyDate = dailyView.querySelector('[data-daily-date]');
  const dailyReference = dailyView.querySelector('[data-daily-reference]');
  const dailySummary = dailyView.querySelector('[data-daily-summary]');
  const dailyExplanation = dailyView.querySelector('[data-daily-explanation]');
  const dailyResponse = dailyView.querySelector('.daily-reading-response');
  const dailyResponseReference = dailyResponse.querySelector('[data-daily-response-reference]');
  const dailyResponseText = dailyResponse.querySelector('[data-daily-response-text]');
  const dailyVersePicker = dailyView.querySelector('[data-daily-verse-picker]');
  const dailyVerseOptions = dailyVersePicker.querySelector('[data-daily-verse-options]');
  const dailyVerseCount = dailyVersePicker.querySelector('[data-daily-verse-count]');
  const dailyUseFull = dailyVersePicker.querySelector('[data-daily-use-full]');
  const dailyPassage = dailyView.querySelector('[data-daily-passage]');
  const dailyStatus = dailyView.querySelector('[data-daily-passage-status]');
  const dailyRetry = dailyView.querySelector('[data-daily-retry]');
  const dailyReflect = dailyView.querySelector('[data-daily-reflect]');
  const dailyReferenceOnly = dailyView.querySelector('[data-daily-reference-only]');
  const planButton = shelf.querySelector('[data-reading-plan]');
  const bibleButton = shelf.querySelector('[data-reading-bible]');
  const bibleStatus = shelf.querySelector('[data-reading-bible-status]');
  let bibleRequest = null;
  let dailyReading = null;
  let dailyScripture = null;
  let dailyRequest = null;
  let openingReflection = false;
  const selectedVerses = new Set();

  const resetBibleOpening = () => {
    bibleRequest = null;
    bibleButton.removeAttribute('aria-disabled');
    bibleStatus.textContent = '';
  };
  const showReadingContent = (mode, fromChoices = false) => {
    const showPlan = mode === 'plan';
    const showDaily = mode === 'daily';
    shelf.dataset.readingMode = mode;
    readingHeading.textContent = showDaily ? '每日默想' : '讀經';
    destinations.classList.toggle('hidden', mode !== 'choices');
    dailyView.classList.toggle('hidden', !showDaily);
    today?.classList.toggle('hidden', !showPlan);
    todayHeader?.classList.toggle('hidden', !showPlan);
    backToChoices.classList.toggle('hidden', !showDaily && (!showPlan || !fromChoices));
    shelf.scrollTop = 0;
  };
  const openReadingShelf = (mode) => {
    if (shelf.open) return;
    showReadingContent(mode);
    shelf.showModal();
  };
  const openShelf = () => openReadingShelf('plan');
  const updateDailySelection = () => {
    dailyVerseCount.textContent = selectedVerses.size ? `已選 ${selectedVerses.size} 節` : '整段經文';
    dailyUseFull.classList.toggle('hidden', !selectedVerses.size);
    for (const button of dailyVerseOptions.querySelectorAll('[data-daily-select-verse]')) {
      button.setAttribute('aria-pressed', String(selectedVerses.has(button.dataset.dailySelectVerse)));
    }
    for (const verse of dailyPassage.querySelectorAll('[data-daily-verse-text]')) {
      verse.classList.toggle('is-selected', selectedVerses.has(verse.dataset.dailyVerseText));
    }
  };
  const updateDailyReflect = () => {
    dailyReflect.disabled = !dailyScripture || openingReflection;
    dailyReferenceOnly.disabled = !dailyReading || openingReflection;
  };
  const loadDailyPassage = async () => {
    if (!dailyReading || dailyRequest || dailyScripture) return;
    const request = new AbortController();
    dailyRequest = request;
    dailyStatus.textContent = '經文載入中…';
    dailyRetry.classList.add('hidden');
    try {
      const passage = await api.readScripture(dailyReading.reference, request.signal);
      if (dailyRequest !== request) return;
      const showChapters = passage.chapterGroups.length > 1;
      const text = passage.chapterGroups.map(group => {
        const verses = group.verses.map(verse =>
          `<span data-daily-verse-text="${group.chapter}:${verse.verse}"><span class="daily-verse-number">${verse.verse}</span>&#8239;${escape(verse.text)}</span>`).join(' ');
        return showChapters ? `<span class="daily-chapter-number">第 ${group.chapter} 章</span> ${verses}` : verses;
      }).join(' ');
      dailyPassage.innerHTML = `<p class="daily-passage-text">${text}</p>`;
      dailyVerseOptions.innerHTML = passage.chapterGroups.map(({chapter, verses}) => `
        <div class="daily-verse-group" role="group" aria-label="第 ${chapter} 章">
          ${showChapters ? `<span>第 ${chapter} 章</span>` : ''}
          ${verses.map(({verse}) => `<button type="button" aria-label="第 ${chapter} 章第 ${verse} 節" data-daily-select-verse="${chapter}:${verse}">${verse}</button>`).join('')}
        </div>`).join('');
      dailyScripture = passage;
      updateDailySelection();
      dailyVersePicker.classList.remove('hidden');
      dailyStatus.textContent = '';
    } catch {
      if (dailyRequest !== request) return;
      dailyStatus.textContent = '經文暫時無法載入。';
      dailyRetry.classList.remove('hidden');
    } finally {
      if (dailyRequest === request) {
        dailyRequest = null;
        updateDailyReflect();
      }
    }
  };
  const selectDailyReading = reading => {
    if (dailyReading === reading) return;
    dailyRequest?.abort();
    dailyRequest = null;
    dailyReading = reading;
    dailyScripture = null;
    selectedVerses.clear();
    dailyVerseOptions.replaceChildren();
    dailyVersePicker.open = false;
    dailyVersePicker.classList.add('hidden');
    dailyPassage.replaceChildren();
    dailyDate.textContent = `${month} 月 ${reading.day} 日`;
    dailyTheme.textContent = reading.title;
    dailyReference.textContent = reading.reference;
    dailySummary.textContent = reading.summary;
    dailyResponse.classList.toggle('hidden', !reading.response);
    dailyResponseReference.textContent = reading.response?.reference || '';
    dailyResponseText.innerHTML = (reading.response?.paragraphs || [])
      .map(paragraph => `<p>${escape(paragraph)}</p>`)
      .join('');
    dailyExplanation.innerHTML = reading.sections.map(section => `
      <section class="daily-explanation-section">
        <div><p class="daily-explanation-range">${escape(section.range)}</p><h5>${escape(section.title)}</h5></div>
        <div class="daily-explanation-copy">
          ${section.paragraphs.map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}
        </div>
      </section>`).join('');
    dailyCalendar.querySelector('[aria-pressed="true"]')?.setAttribute('aria-pressed', 'false');
    dailyCalendar.querySelector(`[data-daily-day="${reading.day}"]`).setAttribute('aria-pressed', 'true');
    updateDailySelection();
    updateDailyReflect();
  };
  const openDailyReading = (reading, showCalendar) => {
    resetBibleOpening();
    selectDailyReading(reading);
    dailyCalendar.open = showCalendar;
    showReadingContent('daily');
    if (!shelf.open) shelf.showModal();
    dailyContent.scrollTop = 0;
    readingHeading.focus({ preventScroll: true });
    loadDailyPassage();
  };
  dailyButton.addEventListener('click', () => {
    const today = new Date();
    const isReadingMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
    openDailyReading(dailyReading || (isReadingMonth && readingsByDay.get(today.getDate())) || dailyReadings[0], true);
  });
  dailyCalendar.addEventListener('click', event => {
    const day = event.target.closest('[data-daily-day]')?.dataset.dailyDay;
    if (!day) return;
    selectDailyReading(readingsByDay.get(Number(day)));
    dailyCalendar.open = false;
    dailyContent.scrollTop = 0;
    dailyTheme.focus({ preventScroll: true });
    loadDailyPassage();
  });
  dailyRetry.addEventListener('click', loadDailyPassage);
  dailyVerseOptions.addEventListener('click', event => {
    const key = event.target.closest('[data-daily-select-verse]')?.dataset.dailySelectVerse;
    if (key && !selectedVerses.delete(key)) selectedVerses.add(key);
    updateDailySelection();
  });
  dailyUseFull.addEventListener('click', () => {
    selectedVerses.clear();
    dailyVersePicker.querySelector('summary').focus({ preventScroll: true });
    updateDailySelection();
  });
  const startReflection = async trigger => {
    const referenceOnly = trigger === dailyReferenceOnly;
    if (!dailyReading || (!referenceOnly && !dailyScripture) || openingReflection) return;
    const reading = dailyReading;
    const scripture = dailyScripture;
    const verses = new Set(selectedVerses);
    const scrollTop = dailyContent.scrollTop;
    openingReflection = true;
    updateDailyReflect();
    shelf.close();
    try {
      if (await api.prepareNewNote()) {
        api.startDailyReflection(reading, scripture, verses, {
          date: dateForDay(reading.day),
          referenceOnly,
        });
      } else {
        shelf.showModal();
        dailyContent.scrollTop = scrollTop;
      }
    } finally {
      openingReflection = false;
      updateDailyReflect();
      if (shelf.open) trigger.focus({ preventScroll: true });
    }
  };
  for (const button of [dailyReflect, dailyReferenceOnly]) {
    button.addEventListener('click', () => startReflection(button).catch(api.onError));
  }
  planButton.addEventListener('click', () => {
    resetBibleOpening();
    showReadingContent('plan', true);
    readingHeading.focus({ preventScroll: true });
  });
  backToChoices.addEventListener('click', () => {
    const returnButton = shelf.dataset.readingMode === 'daily' ? dailyButton : planButton;
    showReadingContent('choices');
    returnButton.focus({ preventScroll: true });
  });
  bibleButton.addEventListener('click', async () => {
    if (bibleRequest) return;
    const request = {};
    bibleRequest = request;
    const returnView = document.body.dataset.currentView;
    const isCurrent = () => shelf.open && bibleRequest === request && document.body.dataset.currentView === returnView;
    bibleButton.setAttribute('aria-disabled', 'true');
    bibleStatus.textContent = '正在開啟聖經…';
    try {
      await api.openBible({ isCurrent, returnView, beforeOpen: () => shelf.close() });
    } catch {
      if (!isCurrent()) return;
      resetBibleOpening();
      bibleStatus.textContent = '聖經載入失敗，請再點一次「整本聖經」。';
    }
  });
  shelf.addEventListener('close', resetBibleOpening);
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
  masthead.querySelector('[data-workspace-new]').addEventListener('click',async()=>{if(!await api.prepareNewNote())return;api.clearNoteForm({clearDraft:true});api.setView('notes');api.noteEditor.focus();});
  masthead.querySelector('[data-workspace-reading]').addEventListener('click', () => openReadingShelf('choices'));
  shelf.querySelector('[data-shelf-close]').addEventListener('click',()=>shelf.close());
  shelf.addEventListener('click', event => {
    if (event.target.closest('[data-today-reading-index], #today-reading-note-btn')) shelf.close();
  }, { capture: true });
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
  scripture.querySelector('#fetch-scripture-btn').textContent = '帶入經文';
  addScripturePicker(scripture, els.noteScripture, api.listVerseNumbers);
  const appendToggle = scripture.querySelector('.note-scripture-toggle');
  const appendLabel = appendToggle.querySelector('.note-helper-full');
  appendLabel.classList.remove('note-helper-full');
  appendLabel.textContent = '將經文加入札記正文';
  appendToggle.querySelector('.note-helper-short').remove();
  appendToggle.classList.add('writing-append-toggle');
  const reflectionReturn = document.createElement('div');
  scripture.querySelector('.note-scripture-control-row').after(appendToggle, reflectionReturn);
  writingAside.append(scripture, detailsWrap);
  const documentTop = document.createElement('div');
  documentTop.className = 'writing-document-top';
  documentTop.append(top, tools);
  writingSurface.prepend(documentTop, title);
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
    if (document.activeElement === api.noteEditor.element && event.target instanceof Element && event.target.closest('button')) {
      event.preventDefault();
    }
  });
  const writingMode = createMobileWritingMode({
    surface: writingSurface, editable: api.noteEditor.element, scriptureInput: els.noteScripture,
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
  const noteCalendar = createNoteCalendar(api.openNote);
  review.addEventListener('click',async event=>{
    const edit=event.target.closest('[data-resume-note]');
    if(edit){
      if(els.noteId.value===edit.dataset.resumeNote&&state.noteDraftDirty){api.setView('notes');api.noteEditor.focus();return;}
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
  manageEditorialDialogFocus(els.authGate);
  const todayObserver=new MutationObserver(()=>renderReadingLinks());
  if(today)todayObserver.observe(today,{subtree:true,childList:true,characterData:true});

  document.body.addEventListener('click',event=>{
    const reflection = event.target.closest('[data-open-daily-reflection]');
    if (reflection) {
      const reading = readingsByDate.get(reflection.dataset.openDailyReflection);
      if (reading) {
        reflection.focus({ preventScroll: true });
        openDailyReading(reading, false);
      }
      return;
    }
    const connection=event.target.closest('[data-open-related-note]');if(connection)api.openNote(connection.dataset.openRelatedNote);
  });
  if(sessionStorage.getItem('devotion-design-preview')==='1'){
    const banner=document.createElement('div');banner.className='workspace-preview-label';banner.innerHTML='<span>設計預覽・範例資料</span><a data-preview-enter href="/preview-start.html?enter=1">返回範例</a><a href="/preview-start.html?reset=1">重設範例</a>';document.body.prepend(banner);
  }

  function renderReflectionLink(note) {
    const date = noteReflectionDate(note);
    if (!readingsByDate.has(date)) return '';
    return `<button type="button" class="text-link daily-reading-return" data-open-daily-reflection="${escape(date)}">回到當日默想</button>`;
  }

  function loadConnections(note = {}) {
    loadedNoteId = els.noteId.value || '';
    editorConnections = normalizeNoteConnections({ ...note, daily_reflection_date: noteReflectionDate(note) });
    state.noteConnections = editorConnections;
    renderEditorConnections();
  }
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
    const reflectionLink = renderReflectionLink(editorConnections);
    reflectionReturn.hidden = !reflectionLink;
    if (reflectionReturn.innerHTML !== reflectionLink) reflectionReturn.innerHTML = reflectionLink;
    const own=els.noteId.value;
    relatedSelect.innerHTML=`<option value="">選擇一篇札記</option>${state.notes.filter(note=>note.id!==own&&!editorConnections.related_notes.includes(note.id)).map(note=>`<option value="${escape(note.id)}">${escape(note.title||'未命名草稿')}</option>`).join('')}`;
    document.getElementById('workspace-related-list').innerHTML=editorConnections.related_notes.map((id,index)=>{const note=state.notes.find(item=>item.id===id);return `<div class="connection-row"><span>${escape(note?.title||'原札記已移除')}</span><button type="button" data-connection-kind="related_notes" data-remove-connection="${index}" aria-label="移除關聯札記">移除</button></div>`;}).join('');
    document.getElementById('workspace-source-list').innerHTML=editorConnections.sources.map((source,index)=>`<div class="connection-row"><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title||new URL(source.url).hostname)}${source.position?` · ${escape(source.position)}`:''}</a><button type="button" data-connection-kind="sources" data-remove-connection="${index}" aria-label="移除來源">移除</button></div>`).join('');
  }
  function refresh() {
    const owner=state.currentUser?.id||'';
    const ownerChanged = owner !== activeOwner;
    if(ownerChanged){writingMode.close({restoreFocus:false, saveDraft:false});activeOwner=owner;api.clearNoteForm({clearDraft:false});loadedNoteId=null;reviewSignature='';}
    const current=state.notes.find(note=>note.id===els.noteId.value);
    if(loadedNoteId!==(els.noteId.value||''))loadConnections(current||{});
    refreshEditorStatus();
    const pending=api.pendingCount();
    menu.querySelector('[data-workspace-pending]').innerHTML=pending?`<p class="workspace-offline-help">其他裝置已有變更時，可將離線內容另存一則，再同步。</p>${api.pendingNotes().map(item=>`<div class="connection-row"><span>${escape(item.note.title)}</span><button type="button" data-pending-copy="${escape(item.note.id)}">另存一則</button></div>`).join('')}`:'';
    menu.querySelector('[data-workspace-sync]').textContent=pending?`${pending} 篇離線札記尚待同步`:state.supabase?state.syncStatus:'此裝置保存';
    menu.querySelector('[data-workspace-sync-pending]').disabled=!state.supabase||!navigator.onLine;
    const signature=JSON.stringify({notes:state.notes.map(note=>[note.id,note.created_at,note.updated_at,note.title,note.status]),books:state.books.map(book=>[book.id,book.updated_at,book.title,book.author_name])});
    if(signature===reviewSignature)return;reviewSignature=signature;
    const notes=[...state.notes].sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at)));
    const lead=notes.find(note=>note.status==='draft')||notes[0];
    const published=notes.filter(note=>note.status!=='draft');
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
        <div class="folio-journal-sidebar">
          <header class="folio-section-heading">
            <h2 id="folio-journal-title">近期札記</h2>
            <button type="button" class="folio-text-action" data-review-view="note-reader">查看全部札記</button>
          </header>
        </div>
        <div class="review-entries">${published.length ? published.slice(0, 4).map(note => `
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
    review.querySelector('.folio-journal-sidebar').append(noteCalendar.element);
    noteCalendar.update(published, ownerChanged);
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

  return {refresh,refreshEditorStatus,closeWritingMode:writingMode.close,closePanel:motion.closePanel,cancelPanelClose:motion.cancelPanelClose,turnPage:motion.turnPage,loadConnections,getConnections:()=>normalizeNoteConnections(editorConnections),renderReflectionLink,renderConnections(note){
    const connections=normalizeNoteConnections(note);
    const backwards=state.notes.filter(item=>item.id!==note.id&&normalizeNoteConnections(item).related_notes.includes(note.id)&&item.status!=='draft');
    const ids=[...new Set([...connections.related_notes,...backwards.map(item=>item.id)])];
    const related=ids.map(id=>state.notes.find(item=>item.id===id&&item.status!=='draft')).filter(Boolean);
    const unavailable=connections.related_notes.filter(id=>!related.some(item=>item.id===id));
    return `${related.length||unavailable.length?`<section class="note-connections-reading"><h3>關聯札記</h3>${related.map(item=>`<button type="button" data-open-related-note="${escape(item.id)}">${escape(item.title)}</button>`).join('')}${unavailable.map(id=>{const draft=state.notes.find(item=>item.id===id);return `<p>${draft?`${escape(draft.title||'關聯札記')}仍為草稿。`:'一篇關聯札記已移除。'}</p>`;}).join('')}</section>`:''}${connections.sources.length?`<section class="note-connections-reading"><h3>引用來源</h3>${connections.sources.map(source=>`<p><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title||new URL(source.url).hostname)}</a>${source.position?` · ${escape(source.position)}`:''}</p>`).join('')}</section>`:''}`;
  }};
}

function createNoteCalendar(openNote) {
  const element = document.createElement('section');
  element.className = 'note-calendar';
  element.setAttribute('aria-labelledby', 'note-calendar-title');
  element.innerHTML = `
    <h3 id="note-calendar-title">札記月曆</h3>
    <div class="note-calendar-header">
      <p id="note-calendar-month" aria-live="polite" aria-atomic="true"></p>
      <div class="note-calendar-navigation">
        <button type="button" data-calendar-month="-1">上個月</button>
        <button type="button" data-calendar-month="0">本月</button>
        <button type="button" data-calendar-month="1">下個月</button>
      </div>
    </div>
    <div class="note-calendar-weekdays" aria-hidden="true">
      ${['日', '一', '二', '三', '四', '五', '六'].map(day => `<span>${day}</span>`).join('')}
    </div>
    <div class="note-calendar-days" role="group" aria-labelledby="note-calendar-month"></div>
    <p class="note-calendar-summary" role="status"></p>
    <ul class="note-calendar-notes" hidden></ul>`;

  const monthLabel = element.querySelector('#note-calendar-month');
  const days = element.querySelector('.note-calendar-days');
  const summary = element.querySelector('.note-calendar-summary');
  const noteList = element.querySelector('.note-calendar-notes');
  const dateKey = (date, day = date.getDate()) => `${date.getFullYear()}-${date.getMonth() + 1}-${day}`;
  const dayButton = day => days.querySelector(`[data-calendar-day="${day}"]`);
  let month = new Date();
  let selectedDay = null;
  let notesByDate = new Map();

  function renderSelection() {
    const notes = notesByDate.get(dateKey(month, selectedDay)) || [];
    const dateLabel = `${month.getMonth() + 1}月${selectedDay}日`;
    summary.textContent = selectedDay
      ? notes.length ? `${dateLabel} · ${notes.length} 篇札記` : `${dateLabel}沒有已儲存的札記。`
      : '';
    noteList.hidden = notes.length === 0;
    noteList.innerHTML = notes.map(note => `<li><button type="button" data-review-note="${escape(note.id)}">${escape(note.title || '未命名札記')}</button></li>`).join('');
    return notes;
  }

  function renderMonth() {
    const today = new Date();
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const monthStart = new Date(year, monthIndex, 1);
    const dayCount = new Date(year, monthIndex + 1, 0).getDate();
    const tabDay = selectedDay || (dateKey(month, 1) === dateKey(today, 1) ? today.getDate() : 1);
    monthLabel.textContent = `${year} 年 ${monthIndex + 1} 月`;
    days.innerHTML = '<span aria-hidden="true"></span>'.repeat(monthStart.getDay()) +
      Array.from({ length: dayCount }, (_, index) => {
        const day = index + 1;
        const key = dateKey(month, day);
        const count = notesByDate.get(key)?.length || 0;
        const isToday = key === dateKey(today);
        return `<button type="button" class="note-calendar-day${count ? ' has-notes' : ''}"
          data-calendar-day="${day}" tabindex="${day === tabDay ? 0 : -1}"
          aria-label="${monthIndex + 1}月${day}日，${count ? `${count} 篇札記` : '無札記'}"
          aria-pressed="${day === selectedDay}"${isToday ? ' aria-current="date"' : ''}>
          <span>${day}</span>${count ? `<small>${count} 篇</small>` : ''}
        </button>`;
      }).join('');
    renderSelection();
  }

  function setTabDay(button) {
    const current = days.querySelector('[tabindex="0"]');
    if (current) current.tabIndex = -1;
    button.tabIndex = 0;
  }

  element.addEventListener('click', event => {
    const monthButton = event.target.closest('[data-calendar-month]');
    if (monthButton) {
      const offset = Number(monthButton.dataset.calendarMonth);
      month = offset ? new Date(month.getFullYear(), month.getMonth() + offset, 1) : new Date();
      selectedDay = null;
      renderMonth();
      return;
    }

    const button = event.target.closest('[data-calendar-day]');
    if (!button) return;
    dayButton(selectedDay)?.setAttribute('aria-pressed', 'false');
    selectedDay = Number(button.dataset.calendarDay);
    button.setAttribute('aria-pressed', 'true');
    setTabDay(button);
    const notes = renderSelection();
    if (notes.length === 1) openNote(notes[0].id);
  });

  days.addEventListener('keydown', event => {
    const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
    if (!offset || !event.target.matches('[data-calendar-day]')) return;
    event.preventDefault();
    const next = dayButton(Number(event.target.dataset.calendarDay) + offset);
    if (!next) return;
    setTabDay(next);
    next.focus({ preventScroll: true });
  });

  return {
    element,
    update(notes, reset) {
      if (reset) {
        month = new Date();
        selectedDay = null;
      }
      notesByDate = new Map();
      for (const note of notes) {
        const created = note.created_at;
        if (!created) continue;
        const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(created) ? `${created}T00:00:00` : created);
        if (!Number.isFinite(date.getTime())) continue;
        const key = dateKey(date);
        if (!notesByDate.has(key)) notesByDate.set(key, []);
        notesByDate.get(key).push(note);
      }
      renderMonth();
    },
  };
}

function addScripturePicker(section, input, listVerseNumbers) {
  const books = getScriptureBookAliasSummary();
  const options = list => list.map(book => `<option value="${book.code}">${book.canonical}</option>`).join('');
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'writing-scripture-picker-toggle';
  trigger.textContent = '選擇經文';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'writing-scripture-picker');
  section.querySelector('.note-scripture-label-row').append(trigger);

  const picker = document.createElement('div');
  picker.id = 'writing-scripture-picker';
  picker.hidden = true;
  picker.innerHTML = `
    <div class="writing-scripture-picker-fields">
      <div><label for="writing-scripture-book">經卷</label><select id="writing-scripture-book"><optgroup label="舊約">${options(books.slice(0, 39))}</optgroup><optgroup label="新約">${options(books.slice(39))}</optgroup></select></div>
      <div><label for="writing-scripture-chapter">章</label><select id="writing-scripture-chapter"></select></div>
      <div><label for="writing-scripture-start">起始節</label><select id="writing-scripture-start"></select></div>
      <div><label for="writing-scripture-end">結束節</label><select id="writing-scripture-end"></select></div>
    </div>
    <p class="caption" role="status"></p>
    <button type="button" class="ghost-btn">套用出處</button>`;
  section.querySelector('.note-scripture-control-row').after(picker);
  const [book, chapter, start, end] = picker.querySelectorAll('select');
  const message = picker.querySelector('[role="status"]');
  const apply = picker.querySelector('button');
  let request = 0;
  let verses = [];

  function setEndOptions() {
    end.disabled = !start.value;
    if (end.disabled) {
      end.replaceChildren(new Option('—', ''));
      return;
    }
    end.replaceChildren(...verses.filter(verse => verse >= Number(start.value)).map(verse => new Option(String(verse), String(verse))));
  }

  async function updateVerses() {
    const run = ++request;
    message.textContent = '';
    verses = [];
    start.disabled = true;
    start.replaceChildren(new Option('整章', ''));
    setEndOptions();
    try {
      const result = await listVerseNumbers(book.value, Number(chapter.value));
      if (run !== request) return;
      verses = result;
      start.append(...verses.map(verse => new Option(String(verse), String(verse))));
      start.disabled = verses.length === 0;
    } catch {
      if (run === request) message.textContent = '無法載入節號，可直接輸入經文出處。';
    }
  }

  function updateChapters() {
    const selected = books.find(item => item.code === book.value);
    chapter.replaceChildren(...Array.from({length: selected.chapters}, (_, index) => new Option(String(index + 1))));
    updateVerses();
  }

  function setOpen(open) {
    picker.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
  }

  trigger.addEventListener('click', () => {
    setOpen(picker.hidden);
    if (!picker.hidden && !chapter.length) updateChapters();
  });
  book.addEventListener('change', updateChapters);
  chapter.addEventListener('change', updateVerses);
  start.addEventListener('change', setEndOptions);
  apply.addEventListener('click', () => {
    const selected = books.find(item => item.code === book.value);
    const verse = start.value ? `:${start.value}${end.value !== start.value ? `-${end.value}` : ''}` : '';
    input.value = `${selected.canonical} ${chapter.value}${verse}`;
    input.dispatchEvent(new Event('input', {bubbles: true}));
    setOpen(false);
    section.querySelector('#fetch-scripture-btn').focus({preventScroll: true});
  });
}

function createMobileWritingMode({surface, editable, scriptureInput, scripture, tools, saveButton, dateline, persistDraft, closeEditorMenu}) {
  const editor = editable.closest('.note-content-section');
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
    if (restoreFocus) editable.focus({preventScroll:true});
  }

  function open() {
    if (expanded) return;
    closeEditorMenu();
    const scrollTop = editable.scrollTop;
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
    editable.scrollTop = scrollTop;
    backButton.focus({preventScroll:true});
  }

  function close({restoreFocus = true, saveDraft = true} = {}) {
    if (!expanded) return;
    const scrollTop = editable.scrollTop;
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
    editable.scrollTop = scrollTop;
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
  editable.addEventListener('focus', () => { if (expanded && !reference.hidden) closeReference(); });
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

// Clip a sheet against the perpendicular bisector of the grabbed and dragged points.
function clipReaderSheet(corners, distance, keepPositive) {
  const result = [];
  corners.forEach((point, index) => {
    const next = corners[(index + 1) % corners.length];
    const start = distance(point), end = distance(next);
    const inside = keepPositive ? start >= 0 : start <= 0;
    if (inside) result.push(point);
    if (inside === (keepPositive ? end >= 0 : end <= 0)) return;
    const ratio = start / (start - end);
    result.push([point[0] + (next[0] - point[0]) * ratio, point[1] + (next[1] - point[1]) * ratio]);
  });
  return result;
}

function readerSheetPolygon(points) {
  return points.length >= 3
    ? `polygon(${points.map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`).join(',')})`
    : 'inset(0 100% 0 0)';
}

export function createReaderPageCurl(stage, { canDrag, previewPage, turnPage, isControl }) {
  const clip = stage.querySelector('.reader-page-clip');
  const current = clip.querySelector('.reader-flow');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let gesture = null;
  let curl = null;
  let animation = 0;
  let suppressClick = false;

  function cancel() {
    cancelAnimationFrame(animation);
    animation = 0;
    gesture = null;
    if (!curl) return;
    curl.under.remove();
    curl.back.remove();
    current.classList.remove('reader-curl-front');
    current.style.clipPath = '';
    current.style.removeProperty('--reader-curl-paper');
    curl = null;
  }

  function prepare(nextHtml, direction, grabY) {
    const { width, height } = clip.getBoundingClientRect();
    const under = document.createElement('div');
    const back = document.createElement('div');
    under.className = 'reader-curl-under';
    back.className = 'reader-curl-back';
    const paper = getComputedStyle(clip.parentElement).backgroundColor;
    current.style.setProperty('--reader-curl-paper', paper);
    const copies = [under, back].map(layer => {
      layer.setAttribute('aria-hidden', 'true');
      layer.inert = true;
      layer.style.backgroundColor = paper;
      const page = current.cloneNode(layer === back);
      page.removeAttribute('id');
      page.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
      page.style.transition = 'none';
      layer.append(page);
      return page;
    });
    const [next, reflected] = copies;
    next.innerHTML = nextHtml;
    next.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    const cast = document.createElement('div');
    const shading = document.createElement('div');
    cast.className = 'reader-curl-cast';
    shading.className = 'reader-curl-shading';
    under.append(cast);
    back.append(shading);
    const stripHeight = `${Math.hypot(width, height) * 2}px`;
    cast.style.height = shading.style.height = stripHeight;
    clip.append(under, back);
    current.classList.add('reader-curl-front');
    curl = { under, back, reflected, cast, shading, direction, width, height,
      x: direction > 0 ? width : 0, y: grabY, distance: 0, lift: 0,
      corners: [[0, 0], [width, 0], [width, height], [0, height]] };
  }

  function draw(distance, lift) {
    const { direction, x, y, corners, back, reflected, cast, shading } = curl;
    curl.distance = distance;
    curl.lift = lift;
    const dx = Math.max(.01, distance) * direction;
    const length = Math.hypot(dx, lift);
    const nx = dx / length, ny = -lift / length;
    const middleX = x - dx / 2, middleY = y + lift / 2;
    const crease = middleX * nx + middleY * ny;
    const fromCrease = ([px, py]) => px * nx + py * ny - crease;
    current.style.clipPath = readerSheetPolygon(clipReaderSheet(corners, fromCrease, false));
    const folded = clipReaderSheet(corners, fromCrease, true);
    back.style.clipPath = readerSheetPolygon(folded.map(point => {
      const offset = 2 * fromCrease(point);
      return [point[0] - offset * nx, point[1] - offset * ny];
    }));
    // Reflect the current page in the crease so the back shows faint ink through the paper.
    const cross = -2 * nx * ny;
    reflected.style.transform = `matrix(${1 - 2 * nx * nx},${cross},${cross},${1 - 2 * ny * ny},${2 * crease * nx},${2 * crease * ny})`;
    const angle = Math.atan2(ny, nx);
    for (const [strip, rotation, width] of [
      [cast, angle, Math.min(64, 8 + length * .19)],
      [shading, angle + Math.PI, Math.min(114, 12 + length * .38)],
    ]) {
      strip.style.left = `${middleX}px`;
      strip.style.top = `${middleY}px`;
      strip.style.width = `${width}px`;
      strip.style.transform = `translateY(-50%) rotate(${rotation}rad)`;
    }
  }

  function settle(complete, duration) {
    const { direction, width, distance, lift } = curl;
    const endDistance = complete ? 2 * width + 2 : 0;
    const started = performance.now();
    const frame = time => {
      const elapsed = Math.min(1, (time - started) / duration);
      const eased = 1 - (1 - elapsed) ** 3;
      draw(distance + (endDistance - distance) * eased, lift * (1 - eased) ** 2);
      if (elapsed < 1) {
        animation = requestAnimationFrame(frame);
      } else {
        cancel();
        if (complete) turnPage(direction);
      }
    };
    animation = requestAnimationFrame(frame);
  }

  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick = false;
    const onEdge = event.target.closest('.reader-turn-zone');
    if (!canDrag() || animation || gesture || (isControl(event) && !onEdge)) return;
    if ((event.pointerType === 'mouse' && !onEdge) || window.getSelection()?.isCollapsed === false) return;
    const edge = event.pointerType === 'mouse' ? (onEdge.matches('.reader-turn-right') ? 1 : -1) : 0;
    gesture = {
      id: event.pointerId, x: event.clientX, y: event.clientY,
      startedAt: event.timeStamp, edge, direction: 0, dragging: false,
    };
  });
  stage.addEventListener('pointermove', event => {
    if (gesture?.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    if (!gesture.dragging) {
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
      const direction = dx < 0 ? 1 : -1;
      const html = previewPage(direction);
      if (html == null || (gesture.edge && direction !== gesture.edge) || window.getSelection()?.isCollapsed === false) {
        gesture = null;
        return;
      }
      gesture.dragging = true;
      gesture.direction = direction;
      stage.setPointerCapture(event.pointerId);
      if (!reduced.matches) {
        const box = clip.getBoundingClientRect();
        prepare(html, direction, Math.max(1, Math.min(box.height - 1, gesture.y - box.top)));
      }
    }
    if (!curl) return;
    const distance = Math.max(0, Math.min(curl.width * 1.2, -dx * gesture.direction));
    const liftLimit = Math.min(curl.height * .25, distance * .75);
    const lift = Math.max(-liftLimit, Math.min(liftLimit, dy));
    const curlBias = (curl.y > curl.height * .5 ? -1 : 1) * distance * .14;
    draw(distance, distance ? lift * Math.min(1, distance / 45) + curlBias : 0);
  });
  stage.addEventListener('pointerup', event => {
    if (gesture?.id !== event.pointerId) return;
    const { direction, dragging, x, startedAt } = gesture;
    gesture = null;
    if (!dragging) return;
    suppressClick = true;
    const threshold = Math.min(85, clip.clientWidth * .23);
    const distance = (x - event.clientX) * direction;
    const complete = distance >= threshold || (distance > 48 && event.timeStamp - startedAt < 220);
    if (curl) settle(complete, complete ? 440 : 260);
    else if (complete) turnPage(direction);
  });
  const cancelGesture = event => {
    if (gesture?.id !== event.pointerId) return;
    gesture = null;
    if (curl) settle(false, 260);
  };
  stage.addEventListener('pointercancel', cancelGesture);
  stage.addEventListener('lostpointercapture', event => {
    if (event.target === stage) cancelGesture(event);
  });
  stage.addEventListener('pointerleave', event => {
    if (gesture?.id === event.pointerId && !gesture.dragging) gesture = null;
  });
  stage.addEventListener('click', event => {
    if (!suppressClick || event.detail === 0) return;
    suppressClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
  reduced.addEventListener('change', cancel);

  return {
    cancel,
    play(direction) {
      if (animation || gesture?.dragging) return true;
      if (!canDrag() || reduced.matches) return false;
      const html = previewPage(direction);
      if (html == null) return false;
      const box = clip.getBoundingClientRect();
      prepare(html, direction, box.height - 2);
      draw(box.width * .16, -box.width * .19);
      settle(true, 500);
      return true;
    },
  };
}

// Existing modal views keep keyboard focus inside the active dialog.
function manageEditorialDialogFocus(authGate){
  let lastAction=null;let previous=[];const origins=new WeakMap();
  const visible=element=>element?.isConnected&&!element.closest('[inert]')&&element.getClientRects().length>0;
  document.addEventListener('click',event=>{lastAction=event.target.closest('button,a,input,select,textarea,summary')||lastAction;},true);
  const dialogs=()=>[...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].filter(visible);
  new MutationObserver(()=>{
    const current=dialogs();
    const view=document.body.dataset.currentView;
    for(const dialog of current)if(!previous.includes(dialog)){
      origins.set(dialog,{trigger:lastAction||document.activeElement,view});
      if(!dialog.contains(document.activeElement))dialog.querySelector('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])')?.focus();
    }
    const writingDialog = current.at(-1)?.matches('.note-main-writing') ? current.at(-1) : null;
    for(const dialog of previous)if(!current.includes(dialog)&&(!current.length||writingDialog)){
      const origin=origins.get(dialog);
      if(origin?.view!==view)continue;
      // A successful sign-in leaves the entire auth gate, including its opener.
      if(authGate?.contains(dialog)&&!visible(authGate))continue;
      const fallback=writingDialog?.querySelector('#writing-focus-reference:not([hidden]) button')
        || writingDialog?.querySelector('.writing-focus-heading button')
        || document.querySelector('.devotion-masthead [data-workspace-view="note-reader"]');
      if(!document.querySelector('dialog[open]')&&(dialog.contains(document.activeElement)||document.activeElement===document.body||!visible(document.activeElement))){
        if(visible(origin?.trigger))origin.trigger.focus({preventScroll:true});else if(visible(fallback))fallback.focus({preventScroll:true});
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
