/* Language bridge for retained pages. English copy is preserved for not-yet-translated details. */
(()=>{'use strict';
const root=document.documentElement,copy=window.BW_COPY||{},nodes=new WeakMap(),attributes=new WeakMap();
let locale=copy[root.lang]?root.lang:'en',queued=false,observer;
const aliases={'Locations':'nav.restaurants','The Club':'nav.night','The Night':'nav.night','Branch menus':'nav.menus','View menus':'nav.menus','Explore menus':'nav.menus','Photo gallery':'nav.gallery','Contact & reservations':'nav.contact','Your name':'book.name','Location':'book.branch','Choose a location':'book.choose','Date at the restaurant':'book.date','Preferred local time':'book.time','Number of guests':'book.guests','Enquiry type':'book.type','Table reservation':'legacy.reserve','Club table / sofa':'book.table','Anything else we should know?':'book.notes','Prepare my enquiry':'book.prepare','Your enquiry is ready.':'book.ready','Get directions':'contact.directions','WhatsApp us':'contact.wa','Make an enquiry':'legacy.reserve','Reserve a table':'legacy.reserve','Open full menu':'menu.original','Get to know us':'home.storyCTA','Explore this location':'home.branchDetails'};
const lookup=new Map(Object.entries(copy.en||{}).map(([k,v])=>[v,k]));for(const [text,key]of Object.entries(aliases))lookup.set(text,key);
const t=key=>copy[locale]?.[key]||copy.en?.[key]||key;
function phrase(raw){if(locale==='en')return raw;const value=raw.trim();const star=value.match(/\s*\*$/)?.[0]||'';const key=lookup.get(value)||lookup.get(value.replace(/\s*\*$/,''));return key?raw.replace(value,t(key)+star):raw;}
function decorate(){document.querySelectorAll('a[href]').forEach(a=>{const h=a.getAttribute('href');if(!/\.html(?:[?#]|$)/.test(h||''))return;try{const u=new URL(h,location.href);if(u.origin!==location.origin)return;u.searchParams.set('lang',locale);a.setAttribute('href',u.pathname.split('/').pop()+u.search+u.hash);}catch{}});}
function render(){
 observer?.disconnect();root.lang=locale;
 document.querySelectorAll('[data-legacy-language]').forEach(e=>{e.value=locale;e.setAttribute('aria-label',t('ui.language'));});
 document.querySelectorAll('[data-i18n]').forEach(e=>{const k=e.dataset.i18n;if(copy.en?.[k])e.textContent=t(k);});
 const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
 while(node=walk.nextNode()){
  const parent=node.parentElement;if(!parent||parent.closest('script,style,svg,textarea,.brand,.original-reader,.form-message,#legacy-translation-note,[data-i18n]'))continue;
  let entry=nodes.get(node);if(!entry||node.data!==entry.last)entry={original:node.data,last:node.data};
  const value=phrase(entry.original);if(node.data!==value)node.data=value;entry.last=value;nodes.set(node,entry);
 }
 document.querySelectorAll('[aria-label],[placeholder]').forEach(e=>{if(e.closest('.original-reader,[data-legacy-language]'))return;let old=attributes.get(e)||{};for(const a of ['aria-label','placeholder']){if(!e.hasAttribute(a))continue;const current=e.getAttribute(a),entry=old[a];if(!entry||current!==entry.last)old[a]={original:current,last:current};const value=phrase(old[a].original);e.setAttribute(a,value);old[a].last=value;}attributes.set(e,old);});
 const note=document.getElementById('legacy-translation-note');if(note){note.hidden=locale==='en';note.textContent=t('legacy.notice');note.lang=locale;}
 decorate();observer?.observe(document.body,{childList:true,characterData:true,subtree:true});
}
function setLanguage(language,save=false){locale=copy[language]?language:'en';if(save){try{localStorage.setItem('bw-language',locale);const u=new URL(location.href);u.searchParams.set('lang',locale);history.replaceState(null,'',u);}catch{}}render();document.dispatchEvent(new CustomEvent('bw:language',{detail:{language:locale}}));}
document.querySelectorAll('[data-legacy-language]').forEach(e=>e.addEventListener('change',()=>setLanguage(e.value,true)));
observer=new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;render();});}});
window.addEventListener('storage',e=>{if(e.key==='bw-language')setLanguage(e.newValue);});
setLanguage(locale);
window.BW_LEGACY_LOCALE={get language(){return locale;},setLanguage,scope:'Translated shared controls, menus-reader interface and approved branch introductions. Remaining English details are identified in the page notice.'};
})();
