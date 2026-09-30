/* Vanilla browser implementation. No analytics, background messages, payments or automatic reservations. */
(() => {
  'use strict';
  const root = document.documentElement;
  const copy = window.BW_COPY || {};
  const config = window.BW_CONFIG || {branches: {}, languages: ['en']};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 760px)');
  const phone = matchMedia('(max-width: 760px)');
  const dataSaver = Boolean(navigator.connection && navigator.connection.saveData);
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch (_) { /* Private/file mode */ } };
  let locale = copy[root.lang] ? root.lang : 'en';
  let motionPaused = root.classList.contains('motion-paused');
  const t = key => (copy[locale] && copy[locale][key]) || (copy.en && copy.en[key]) || key;
  let lastFocus = null;
  let formResultData = null;
  const playerStates = new Map();

  function translate(parent = document) {
    $$('[data-i18n]', parent).forEach(el => { const value = t(el.dataset.i18n); if (el.textContent !== value) el.textContent = value; });
    $$('[data-i18n-aria]', parent).forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
    $$('[data-i18n-placeholder]', parent).forEach(el => el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder)));
  }
  function decorateLinks() {
    $$('a[href]').forEach(a => {
      const raw = a.getAttribute('href');
      if (!raw || !/\.html(?:[?#]|$)/.test(raw)) return;
      try {
        const url = new URL(raw, location.href);
        if (url.origin !== location.origin || url.protocol !== location.protocol) return;
        url.searchParams.set('lang', locale);
        a.setAttribute('href', url.pathname.split('/').pop() + url.search + url.hash);
      } catch (_) { /* An invalid link is not followed or rewritten. */ }
    });
  }
  function setLanguage(next, persist = false) {
    locale = config.languages.includes(next) && copy[next] ? next : 'en';
    root.lang = locale;
    $$('[data-language]').forEach(el => { el.value = locale; el.setAttribute('aria-label', t('ui.language')); });
    if (persist) {
      save('bw-language', locale);
      try { const u = new URL(location.href); u.searchParams.set('lang', locale); history.replaceState(null, '', u); } catch (_) { /* file:// fallback uses link parameters */ }
    }
    translate(); decorateLinks(); updateThemeControl(); updateMotionControl(); updateNavigationLabel();
    playerStates.forEach((state, video) => updatePlayerUI(video));
    if (formResultData) renderEnquiry(formResultData);
    document.dispatchEvent(new CustomEvent('bw:language', {detail: {language: locale}}));
  }
  $$('[data-language]').forEach(el => el.addEventListener('change', () => setLanguage(el.value, true)));
  function updateThemeControl() {
    const light = root.dataset.appearance === 'light';
    $$('[data-theme-toggle]').forEach(b => {
      b.dataset.i18nAria = light ? 'ui.dark' : 'ui.light';
      b.setAttribute('aria-label', t(b.dataset.i18nAria));
      b.setAttribute('aria-pressed', String(light));
      b.title = t(b.dataset.i18nAria);
      b.innerHTML = light ? '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14a8 8 0 0 1-10-10 8 8 0 1 0 10 10Z"/></svg>' : '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/></svg>';
    });
    $('meta[name="theme-color"]')?.setAttribute('content', light ? '#faf6ee' : '#09090c');
  }
  $$('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => {
    root.dataset.appearance = root.dataset.appearance === 'light' ? 'dark' : 'light';
    save('bw-appearance', root.dataset.appearance); updateThemeControl();
  }));
  const menuButton = $('[data-nav-toggle]'), nav = $('#mobile-nav');
  function updateNavigationLabel() {
    if (menuButton && nav) { menuButton.dataset.i18nAria = nav.hidden ? 'nav.open' : 'nav.close'; menuButton.setAttribute('aria-label', t(menuButton.dataset.i18nAria)); }
  }
  function closeNavigation(focus = false) {
    if (!nav || !menuButton) return;
    nav.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); updateNavigationLabel();
    if (focus) menuButton.focus();
  }
  menuButton?.addEventListener('click', () => { nav.hidden = !nav.hidden; menuButton.setAttribute('aria-expanded', String(!nav.hidden)); updateNavigationLabel(); });
  $$('a', nav || document.createElement('nav')).forEach(a => a.addEventListener('click', () => closeNavigation()));
  document.addEventListener('click', e => { if (nav && !nav.hidden && !nav.contains(e.target) && !menuButton.contains(e.target)) closeNavigation(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav && !nav.hidden) closeNavigation(true); });

  // Only the visible, permitted players receive a source. Lower-page/hidden videos never preload.
  function updateMotionControl() {
    const off = motionPaused || reduce.matches;
    root.classList.toggle('motion-paused', off);
    $$('[data-motion-toggle]').forEach(button => {
      const key = reduce.matches ? 'ui.reduced' : motionPaused ? 'ui.resume' : 'ui.pause';
      button.setAttribute('aria-pressed', String(off));
      button.disabled = reduce.matches;
      const label = $('[data-i18n]', button); if (label) { label.dataset.i18n = key; label.textContent = t(key); }
    });
  }
  function updatePlayerUI(video) {
    const state = playerStates.get(video); if (!state) return;
    const playing = !video.paused && !video.ended;
    state.card.classList.toggle('is-playing', playing);
    const key = playing ? 'ui.pauseVideo' : 'ui.play';
    state.button.dataset.i18nAria = key; state.button.setAttribute('aria-label', t(key));
    state.button.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + (playing ? '<path d="M8 5v14M16 5v14"/>' : '<path d="m8 4 12 8-12 8Z"/>') + '</svg>';
  }
  function wantedSource(video) {
    return (narrow.matches || dataSaver) && video.dataset.mobileVideo ? video.dataset.mobileVideo : video.dataset.video;
  }
  function canRun(video, state) {
    const shown = Boolean(state.card.getClientRects().length && state.card.offsetWidth);
    const permitted = state.manualPlay || (!motionPaused && !reduce.matches && !dataSaver && !state.userPaused);
    return shown && state.inView && !document.hidden && !document.body.classList.contains('modal-open') && permitted;
  }
  async function syncPlayer(video) {
    const state = playerStates.get(video); if (!state) return;
    const token = ++state.token;
    if (!canRun(video, state)) { video.pause(); updatePlayerUI(video); return; }
    const source = wantedSource(video);
    if (video.dataset.loadedSource !== source) {
      video.pause(); video.src = source; video.dataset.loadedSource = source; video.muted = true; video.defaultMuted = true; video.load();
    }
    try {
      if (video.paused) await video.play();
      if (!canRun(video, state)) video.pause();
    } catch (_) { /* Autoplay may be denied; poster and accessible manual-play button remain. */ }
    updatePlayerUI(video);
  }
  function syncPlayers() { playerStates.forEach((s, v) => { syncPlayer(v); }); }
  $$('[data-video-card]').forEach(card => {
    const video = $('video', card), button = $('[data-video-play]', card);
    const state = {card, button, inView: false, userPaused: false, manualPlay: false, token: 0};
    playerStates.set(video, state);
    ['play', 'pause', 'ended', 'error'].forEach(type => video.addEventListener(type, () => updatePlayerUI(video)));
    button.addEventListener('click', () => {
      if (!video.paused) { state.userPaused = true; state.manualPlay = false; video.pause(); }
      else {
        playerStates.forEach((other, v) => { if (v !== video && (reduce.matches || dataSaver || motionPaused)) { other.manualPlay = false; v.pause(); } });
        state.userPaused = false; state.manualPlay = true; state.inView = true; syncPlayer(video);
      }
      updatePlayerUI(video);
    });
  });
  let videoObserver;
  if ('IntersectionObserver' in window) {
    videoObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      const v = $('video', entry.target), state = playerStates.get(v);
      state.inView = entry.isIntersecting && entry.intersectionRatio >= .12;
      syncPlayer(v);
    }), {threshold: [0, .12, .3]});
    playerStates.forEach(state => videoObserver.observe(state.card));
  } else { playerStates.forEach(state => { state.inView = true; }); }
  function updateVideoLayout() {
    $('#video-wall')?.classList.toggle('solo', narrow.matches || dataSaver);
    playerStates.forEach((state, video) => {
      const rect = state.card.getBoundingClientRect();
      state.inView = Boolean(rect.width && rect.bottom > 0 && rect.top < innerHeight);
      const shown = Boolean(state.card.offsetWidth && state.card.getClientRects().length);
      if (!shown && video.dataset.loadedSource) {video.pause();video.removeAttribute('src');video.load();delete video.dataset.loadedSource;state.manualPlay=false;}
      if (video.dataset.posterDesktop) video.poster = narrow.matches && video.dataset.posterMobile ? video.dataset.posterMobile : video.dataset.posterDesktop;
      const source = wantedSource(video);
      if (video.dataset.loadedSource && source !== video.dataset.loadedSource) {
        video.pause(); video.removeAttribute('src'); video.load(); delete video.dataset.loadedSource;
      }
    });
    syncPlayers();
  }
  $$('[data-motion-toggle]').forEach(button => button.addEventListener('click', () => {
    motionPaused = !motionPaused; save('bw-motion-paused', motionPaused ? '1' : '0');
    playerStates.forEach(state => { state.manualPlay = false; state.userPaused = false; });
    updateMotionControl(); syncPlayers();
  }));
  reduce.addEventListener('change', () => { playerStates.forEach(state => { state.manualPlay = false; }); updateMotionControl(); syncPlayers(); });
  narrow.addEventListener('change', updateVideoLayout); phone.addEventListener('change', updateVideoLayout);
  document.addEventListener('visibilitychange', syncPlayers);
  window.addEventListener('pagehide', () => playerStates.forEach((s, v) => v.pause()));
  window.addEventListener('pageshow', () => { closeNavigation(); updateVideoLayout(); });
  let resizeTimer; window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (innerWidth > 1030) closeNavigation(); updateVideoLayout(); }, 150); }, {passive: true});
  const artwork = $('.soundstage');
  if (artwork && 'IntersectionObserver' in window) new IntersectionObserver(entries => entries.forEach(e => artwork.classList.toggle('offscreen', !e.isIntersecting)), {threshold: .05}).observe(artwork);

  // Fully keyboard-accessible offer tabs; no cart or purchase actions.
  const tabs = $$('[data-offer-tab]');
  function showOffer(index, focus = false) {
    tabs.forEach((tab, i) => { const selected = i === index; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; });
    $$('[data-offer-panel]').forEach(panel => { panel.hidden = Number(panel.dataset.offerPanel) !== index; });
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => showOffer(i));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); showOffer(next, true); }
    });
  });

  function openDialog(dialog, trigger) {
    if (!dialog || typeof dialog.showModal !== 'function') return false;
    lastFocus = trigger || document.activeElement;
    document.body.classList.add('modal-open'); dialog.showModal(); syncPlayers(); return true;
  }
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); lastFocus?.focus({preventScroll: true}); syncPlayers(); });
    dialog.addEventListener('click', e => {
      if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); }
    });
  });
  $$('[data-close-dialog]').forEach(b => b.addEventListener('click', () => document.getElementById(b.dataset.closeDialog)?.close()));
  const booking = $('#booking-dialog'), form = $('#booking-form'), result = $('#book-result'), error = $('#book-error');
  function localNow(timezone) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'}).formatToParts(new Date()).map(p => [p.type, p.value]));
    return {date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}`};
  }
  function syncDate() {
    const branch = config.branches[$('#book-branch').value];
    if (branch) $('#book-date').min = localNow(branch.timezone).date; else $('#book-date').removeAttribute('min');
    const title = $('#book-title'), key = $('#book-branch').value === 'club' ? 'book.title' : 'book.restaurantTitle';
    if (title) {title.dataset.i18n = key; title.textContent = t(key);}
    const type = $('#book-type');
    if (type && $('#book-branch').value !== 'club' && type.value === 'table') type.value = 'dinner';
  }
  $$('[data-book]').forEach(button => button.addEventListener('click', () => {
    const branch = config.branches[button.dataset.book] ? button.dataset.book : ''; 
    $('#book-branch').value = branch; $('#book-type').value = button.dataset.bookType || (branch === 'club' ? 'table' : 'dinner');
    form.hidden = false; result.hidden = true; error.hidden = true; formResultData = null; syncDate();
    if (!openDialog(booking, button)) location.href = branch ? 'https://wa.me/' + config.branches[branch].phone : 'locations.html';
  }));
  $('#book-branch')?.addEventListener('change', syncDate);
  $('#book-edit')?.addEventListener('click', () => { form.hidden = false; result.hidden = true; formResultData = null; $('#book-name').focus(); });
  function renderEnquiry(data) {
    const branch = config.branches[data.branch];
    const venue = data.branch === 'club' ? branch.name : 'Bollywood Indian Cuisine — ' + branch.name;
    const dateLocale = {en:'en-GB',hi:'hi-IN',ta:'ta-IN',id:'id-ID',th:'th-TH-u-ca-gregory'}[locale] || 'en-GB';
    const displayDate = new Intl.DateTimeFormat(dateLocale,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(data.date+'T12:00:00Z'));
    const place = branch.timezone === 'Asia/Bangkok' ? 'Phuket' : 'Bali';
    const subject = data.type === 'dinner' ? t('home.enquirySubject') : t('book.' + data.type);
    const lines = [t('home.greeting') + ' ' + venue + ',', subject, '', t('home.enquiryName')+': '+data.name, t('home.enquiryDate')+': '+displayDate, t('home.enquiryTime')+': '+data.time+' ('+place+' · '+t('home.localTime')+')', t('home.enquiryGuests')+': '+data.guests];
    if (data.notes) lines.push(t('home.enquiryNotes')+': '+data.notes);
    lines.push('', t('book.confirm'));
    const text = lines.join('\n'); $('#book-message').textContent = text;
    $('#book-handoff').href = 'https://wa.me/' + branch.phone + '?text=' + encodeURIComponent(text);
  }
  form?.addEventListener('submit', event => {
    event.preventDefault(); error.hidden = true;
    const data = {branch: $('#book-branch').value, name: $('#book-name').value.trim().replace(/\s+/g, ' '), date: $('#book-date').value, time: $('#book-time').value, guests: Number($('#book-guests').value), type: $('#book-type').value, notes: $('#book-notes').value.trim()};
    if (!config.branches[data.branch] || !data.name || !/^\d{4}-\d{2}-\d{2}$/.test(data.date) || !/^\d{2}:\d{2}$/.test(data.time) || !Number.isInteger(data.guests) || data.guests < 1 || data.guests > 500 || !['table','private','dinner'].includes(data.type)) {
      error.textContent = t('book.invalid'); error.hidden = false; return;
    }
    const now = localNow(config.branches[data.branch].timezone);
    if (data.date < now.date || (data.date === now.date && data.time < now.time)) { error.textContent = t('book.past'); error.hidden = false; $('#book-date').focus(); return; }
    formResultData = data; renderEnquiry(data); form.hidden = true; result.hidden = false; $('#book-handoff').focus();
  });

  // Original-language published menu pages retain exact price pixels and aspect ratios.
  let menuIndex = 0;
  const menuPages = (config.menuPages || []).filter(p => p.kind === 'club');
  function showMenuPage(index) {
    menuIndex = Math.max(0, Math.min(menuPages.length - 1, index)); const page = menuPages[menuIndex]; if (!page) return;
    $('#menu-page-image').src = page.file; $('#menu-page-image').alt = t('menu.page') + ' ' + page.page;
    $('#menu-page-image').width = page.width; $('#menu-page-image').height = page.height;
    $('#menu-page-num').textContent = String(page.page); $('#menu-total').textContent = String(menuPages.length);
    $('[data-menu-prev]').disabled = menuIndex === 0; $('[data-menu-next]').disabled = menuIndex === menuPages.length - 1;
  }
  $$('[data-open-menu]').forEach(button => button.addEventListener('click', () => { showMenuPage(0); openDialog($('#menu-dialog'), button); }));
  $('[data-menu-prev]')?.addEventListener('click', () => showMenuPage(menuIndex - 1));
  $('[data-menu-next]')?.addEventListener('click', () => showMenuPage(menuIndex + 1));
  $('#menu-dialog')?.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { e.preventDefault(); showMenuPage(menuIndex - 1); } if (e.key === 'ArrowRight') { e.preventDefault(); showMenuPage(menuIndex + 1); } });
  window.addEventListener('storage', event => {
    if (event.key === 'bw-language') setLanguage(event.newValue);
    if (event.key === 'bw-appearance') { root.dataset.appearance = event.newValue === 'light' ? 'light' : 'dark'; updateThemeControl(); }
  });
  setLanguage(locale); updateVideoLayout();
  window.BW_PREVIEW = {version: 6, scope: 'Integration B1: connected restaurant-first homepage, retained branch pages, source-menu readers and The Night.', get language() { return locale; }, get appearance() { return root.dataset.appearance; }, get playingVideos() { return Array.from(playerStates.keys()).filter(v => !v.paused).length; }, get translationKeys() { return Object.keys(copy.en || {}).length; }, setLanguage};
})();
