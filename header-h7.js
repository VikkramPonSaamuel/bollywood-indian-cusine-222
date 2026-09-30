window.BW_H7_COPY={"en":{"nav.restaurants":"Restaurants","nav.menus":"Menus","nav.story":"Our story","nav.gallery":"Gallery","nav.night":"The Night","nav.contact":"Contact","nav.book":"Book a table","nav.open":"Open navigation","nav.close":"Close navigation","ui.language":"Language","ui.dark":"Dark view","ui.light":"White view"},"hi":{"nav.restaurants":"रेस्तराँ","nav.menus":"मेन्यू","nav.story":"हमारी कहानी","nav.gallery":"गैलरी","nav.night":"The Night","nav.contact":"संपर्क","nav.book":"टेबल बुक करें","nav.open":"नेविगेशन खोलें","nav.close":"नेविगेशन बंद करें","ui.language":"भाषा","ui.dark":"डार्क मोड","ui.light":"लाइट मोड"},"ta":{"nav.restaurants":"உணவகங்கள்","nav.menus":"உணவுப் பட்டியல்","nav.story":"எங்கள் கதை","nav.gallery":"படத்தொகுப்பு","nav.night":"The Night","nav.contact":"தொடர்பு","nav.book":"மேசை முன்பதிவு","nav.open":"வழிசெலுத்தலைத் திறக்கவும்","nav.close":"வழிசெலுத்தலை மூடவும்","ui.language":"மொழி","ui.dark":"இருண்ட தோற்றம்","ui.light":"வெளிர் தோற்றம்"},"id":{"nav.restaurants":"Restoran","nav.menus":"Menu","nav.story":"Cerita kami","nav.gallery":"Galeri","nav.night":"The Night","nav.contact":"Kontak","nav.book":"Pesan meja","nav.open":"Buka navigasi","nav.close":"Tutup navigasi","ui.language":"Bahasa","ui.dark":"Tampilan gelap","ui.light":"Tampilan terang"},"th":{"nav.restaurants":"ร้านอาหาร","nav.menus":"เมนู","nav.story":"เรื่องราวของเรา","nav.gallery":"แกลเลอรี","nav.night":"The Night","nav.contact":"ติดต่อ","nav.book":"จองโต๊ะ","nav.open":"เปิดเมนูนำทาง","nav.close":"ปิดเมนูนำทาง","ui.language":"ภาษา","ui.dark":"โหมดมืด","ui.light":"โหมดสว่าง"}};
/* Runs directly after the source-rendered header, before first paint. COPY is generated from existing translations. */
(()=>{'use strict';const root=document.documentElement,h=document.querySelector('.bw-shared-header');if(!h||window.BW_HEADER_CONTROLS_H7)return;
const nav=h.querySelector('#bw-mobile-navigation'),toggle=h.querySelector('[data-h7-toggle]'),select=h.querySelector('[data-h7-language]'),theme=h.querySelector('[data-h7-theme]');
const dictionaries=window.BW_H7_COPY||{},lang=()=>dictionaries[root.lang]?root.lang:'en',t=k=>dictionaries[lang()]?.[k]||dictionaries.en?.[k]||k;

const nyCutoff=Date.parse('2027-01-01T16:00:00Z');
function installNewYearLink(){
  const active=Date.now()<nyCutoff;
  h.querySelectorAll('.bw-new-year-link').forEach(a=>{if(!active)a.remove();});
  if(!active)return;
  for(const parent of [h.querySelector('.desktop-nav'),nav]){
    if(!parent||parent.querySelector('.bw-new-year-link'))continue;
    const contact=[...parent.querySelectorAll('a')].find(a=>/contact.html/.test(a.getAttribute('href')||''));
    const a=document.createElement('a');
    a.className='bw-new-year-link';
    a.href='new-year-2027.html';
    a.setAttribute('aria-label','New Year 2027 reservations and floor map');
    a.innerHTML='<span class="bw-new-year-dot" aria-hidden="true"></span><span>New Year 2027</span>';
    parent.insertBefore(a,contact||null);
  }
}
installNewYearLink();
const moon='<svg class="bw-h7-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14a8 8 0 0 1-10-10 8 8 0 1 0 10 10Z"/></svg>',sun='<svg class="bw-h7-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/></svg>';
function render(){h.querySelectorAll('[data-h7-copy]').forEach(e=>{const value=t(e.dataset.h7Copy);if(e.textContent!==value)e.textContent=value;});select.value=lang();select.setAttribute('aria-label',t('ui.language'));toggle.setAttribute('aria-label',t(nav.hidden?'nav.open':'nav.close'));const light=root.dataset.appearance==='light';theme.setAttribute('aria-label',t(light?'ui.dark':'ui.light'));theme.title=t(light?'ui.dark':'ui.light');theme.setAttribute('aria-pressed',String(light));if(theme.dataset.rendered!==String(light)){theme.innerHTML=light?moon:sun;theme.dataset.rendered=String(light);}h.querySelectorAll('a[href]').forEach(a=>{try{const u=new URL(a.getAttribute('href'),location.href);if(u.origin===location.origin&&/\.html$/.test(u.pathname)){u.searchParams.set('lang',lang());const value=u.pathname.split('/').pop()+u.search+u.hash;if(a.getAttribute('href')!==value)a.setAttribute('href',value);}}catch{}});}
function close(focus=false){nav.hidden=true;toggle.setAttribute('aria-expanded','false');render();if(focus)toggle.focus({preventScroll:true});h.dispatchEvent(new CustomEvent('bw:headerlayout',{bubbles:true}));}
toggle.addEventListener('click',()=>{nav.hidden=!nav.hidden;toggle.setAttribute('aria-expanded',String(!nav.hidden));render();h.dispatchEvent(new CustomEvent('bw:headerlayout',{bubbles:true}));});
nav.addEventListener('click',e=>{if(e.target.closest('a'))close();});document.addEventListener('click',e=>{if(!nav.hidden&&!h.contains(e.target))close();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!nav.hidden){e.preventDefault();close(true);}});
select.addEventListener('change',()=>{const value=select.value;if(!dictionaries[value])return;try{localStorage.setItem('bw-language',value);}catch{}root.lang=value;if(window.BW_LEGACY_LOCALE?.setLanguage)window.BW_LEGACY_LOCALE.setLanguage(value,true);else if(window.BW_PREVIEW?.setLanguage)window.BW_PREVIEW.setLanguage(value,true);else document.dispatchEvent(new CustomEvent('bw:language',{detail:{language:value}}));render();});
theme.addEventListener('click',()=>{const value=root.dataset.appearance==='light'?'dark':'light';root.dataset.appearance=value;root.style.colorScheme=value;try{localStorage.setItem('bw-appearance',value);}catch{}document.querySelector('meta[name="theme-color"]')?.setAttribute('content',value==='light'?'#faf7f0':'#0b0b0d');document.dispatchEvent(new CustomEvent('bw:appearance',{detail:{theme:value}}));render();});
document.addEventListener('bw:language',render);document.addEventListener('bw:appearance',render);window.addEventListener('storage',e=>{if(e.key==='bw-appearance'||e.key==='bw-language')render();});window.addEventListener('pageshow',()=>close());window.addEventListener('resize',()=>{if(getComputedStyle(toggle).display==='none'&&!nav.hidden)close();},{passive:true});
render();window.BW_HEADER_CONTROLS_H7={version:'H7',render,close,get language(){return lang()},get menuOpen(){return !nav.hidden}};
})();
