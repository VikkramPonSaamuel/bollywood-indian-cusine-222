/* M2: display the owner's existing menu-page images inside website cards. */
(()=>{'use strict';
if(window.BW_MENU_M2)return;
const words={
en:['Explore the menus','Previous page','Next page','Page','Loading menu page','This page could not be loaded.','Try again','Indian Menu','Western Menu','Drinks Menu','Desserts Menu','Shisha Menu','Drinks & Snacks'],
hi:['मेन्यू देखें','पिछला पृष्ठ','अगला पृष्ठ','पृष्ठ','मेन्यू का पृष्ठ लोड हो रहा है','यह पृष्ठ लोड नहीं हो सका।','फिर प्रयास करें','भारतीय मेन्यू','पाश्चात्य मेन्यू','पेय मेन्यू','मिठाइयों का मेन्यू','शीशा मेन्यू','पेय और स्नैक्स'],
ta:['மெனுக்களைப் பாருங்கள்','முந்தைய பக்கம்','அடுத்த பக்கம்','பக்கம்','மெனு பக்கம் ஏற்றப்படுகிறது','இந்தப் பக்கத்தை ஏற்ற முடியவில்லை.','மீண்டும் முயலுங்கள்','இந்திய உணவு மெனு','மேற்கத்திய உணவு மெனு','பான மெனு','இனிப்பு மெனு','ஷிஷா மெனு','பானங்கள் மற்றும் சிற்றுண்டிகள்'],
id:['Jelajahi menu','Halaman sebelumnya','Halaman berikutnya','Halaman','Memuat halaman menu','Halaman ini tidak dapat dimuat.','Coba lagi','Menu India','Menu Barat','Menu Minuman','Menu Hidangan Penutup','Menu Shisha','Minuman & Camilan'],
th:['เลือกดูเมนู','หน้าก่อนหน้า','หน้าถัดไป','หน้า','กำลังโหลดหน้าเมนู','ไม่สามารถโหลดหน้านี้ได้','ลองอีกครั้ง','เมนูอาหารอินเดีย','เมนูอาหารตะวันตก','เมนูเครื่องดื่ม','เมนูของหวาน','เมนูชิชา','เครื่องดื่มและของว่าง']};
const locale=()=>words[document.documentElement.lang]?document.documentElement.lang:'en';
const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.classList.contains('motion-paused');
const arrow=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d==='left'?'m15 5-7 7 7 7':d==='right'?'m9 5 7 7-7 7':'m5 9 7 7 7-7'}"/></svg>`;
const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
const titleIndex=m=>m.id.endsWith('drinks-snacks')?12:m.id.endsWith('western')?8:m.id.endsWith('drinks')?9:m.id.endsWith('desserts')?10:m.id.endsWith('shisha')?11:7;
class MenuReader{
constructor(host,menus){
this.host=host;this.menus=menus;this.lang=locale();this.copy=words[this.lang];this.cards=new Map();this.activeId=null;
host.classList.add('im-root');host.lang=this.lang;host.replaceChildren();
const layout=el('div','im-layout'),nav=el('nav','im-menu-nav'),title=el('h2','',this.copy[0]),cards=el('div','im-cards');
nav.setAttribute('aria-label',this.copy[0]);nav.append(title);layout.append(nav,cards);host.append(layout);this.nav=nav;this.navTitle=title;
menus.forEach((m,i)=>this.make(m,i,nav,cards));const initial=menus.find((m,i)=>location.hash==='#menu-'+i)?.id||menus[0].id;this.open(initial,false);}
make(menu,i,nav,cards){
const id='menu-'+i,title=this.copy[titleIndex(menu)],tab=el('button','im-menu-tab'),tabText=el('span','',title);
tab.type='button';tab.append(tabText);tab.insertAdjacentHTML('beforeend',arrow('right'));tab.setAttribute('aria-controls',id);nav.append(tab);
const card=el('article','im-card');card.id=id;card.dataset.menuId=menu.id;
const h=el('h2','im-card-heading'),toggle=el('button','im-card-toggle'),titleBox=el('span'),kicker=el('span','im-kicker',menu.branch+' · '+menu.currency),label=el('span','im-title',title),expand=el('span','im-expand');
expand.setAttribute('aria-hidden','true');expand.innerHTML=arrow('down');titleBox.append(kicker,label);toggle.type='button';toggle.id=id+'-toggle';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls',id+'-content');toggle.append(titleBox,expand);h.append(toggle);
const content=el('div','im-content');content.id=id+'-content';content.hidden=true;content.setAttribute('role','region');content.setAttribute('aria-labelledby',toggle.id);
const stage=el('figure','im-stage');stage.tabIndex=0;const image=el('img');image.draggable=false;image.decoding='async';image.setAttribute('translate','no');
const prev=el('button','im-page-arrow im-prev'),next=el('button','im-page-arrow im-next');prev.type=next.type='button';prev.innerHTML=arrow('left');next.innerHTML=arrow('right');
const count=el('p','im-counter'),status=el('p','im-sr');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
const originalText=el('p','im-sr');originalText.setAttribute('translate','no');originalText.lang='en';
const error=el('div','im-error'),errText=el('p','',this.copy[5]),retry=el('button','',this.copy[6]);error.hidden=true;error.setAttribute('role','alert');retry.type='button';error.append(errText,retry);
stage.append(image,prev,next);content.append(stage,count,error,status,originalText);card.append(h,content);cards.append(card);
const s={menu,card,tab,tabText,toggle,label,content,stage,image,prev,next,count,status,error,errText,retry,originalText,index:0,wanted:0,token:0,loaded:false};this.cards.set(menu.id,s);
tab.addEventListener('click',()=>{this.open(menu.id,true);this.setHash(card.id);});
toggle.addEventListener('click',()=>{if(this.activeId===menu.id)this.close(s);else{this.open(menu.id,false);this.setHash(card.id);}});
prev.addEventListener('click',()=>this.draw(s,s.wanted-1));next.addEventListener('click',()=>this.draw(s,s.wanted+1));retry.addEventListener('click',()=>this.draw(s,s.wanted,true));
stage.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;const move={ArrowLeft:s.wanted-1,ArrowRight:s.wanted+1,Home:0,End:menu.pages.length-1};if(e.key in move){e.preventDefault();this.draw(s,move[e.key]);}});
let touch=null;stage.addEventListener('touchstart',e=>{touch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});
stage.addEventListener('touchend',e=>{if(!touch||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;touch=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.4)this.draw(s,s.wanted+(dx<0?1:-1));},{passive:true});
stage.addEventListener('touchcancel',()=>touch=null,{passive:true});this.translate(s);}
setHash(id){try{const u=new URL(location.href);u.hash=id;history.replaceState(null,'',u);}catch{}}
close(s){s.content.hidden=true;s.toggle.setAttribute('aria-expanded','false');s.card.dataset.open='false';s.tab.removeAttribute('aria-current');if(this.activeId===s.menu.id)this.activeId=null;}
open(id,scroll=true){const s=this.cards.get(id);if(!s)return;for(const other of this.cards.values())if(other!==s)this.close(other);s.content.hidden=false;s.toggle.setAttribute('aria-expanded','true');s.card.dataset.open='true';s.tab.setAttribute('aria-current','true');this.activeId=id;if(!s.loaded)this.draw(s,s.index);if(scroll)requestAnimationFrame(()=>s.card.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'}));}
async draw(s,index,retry=false){const pages=s.menu.pages;index=Math.max(0,Math.min(pages.length-1,index));if(s.loaded&&index===s.index&&index===s.wanted&&!retry)return;
const token=++s.token;s.wanted=index;const p=pages[index];s.error.hidden=true;s.stage.hidden=false;s.stage.setAttribute('aria-busy','true');s.status.textContent=this.copy[4];
if(!s.loaded){s.image.width=p.width;s.image.height=p.height;s.image.style.aspectRatio=`${p.width} / ${p.height}`;}
const preload=new Image();preload.src=p.image;
try{if(preload.decode)await preload.decode();else await new Promise((ok,bad)=>{if(preload.complete&&preload.naturalWidth)ok();else{preload.onload=ok;preload.onerror=bad;}});
if(token!==s.token)return;s.image.src=p.image;s.image.width=p.width;s.image.height=p.height;s.image.style.aspectRatio=`${p.width} / ${p.height}`;s.index=index;s.wanted=index;s.loaded=true;s.stage.dataset.pageIndex=String(index);
s.image.classList.remove('im-fade');void s.image.offsetWidth;s.image.classList.add('im-fade');s.originalText.textContent=p.search||'';this.translate(s);s.stage.setAttribute('aria-busy','false');
if(index+1<pages.length&&!navigator.connection?.saveData){const nextImage=new Image();nextImage.src=pages[index+1].image;}
}catch{if(token!==s.token)return;s.stage.setAttribute('aria-busy','false');s.stage.hidden=true;s.count.hidden=true;s.error.hidden=false;s.status.textContent='';}}
translate(s){const title=this.copy[titleIndex(s.menu)];s.label.textContent=title;s.tabText.textContent=title;s.prev.setAttribute('aria-label',this.copy[1]+' — '+title);s.next.setAttribute('aria-label',this.copy[2]+' — '+title);s.prev.disabled=s.index===0;s.next.disabled=s.index===s.menu.pages.length-1;s.prev.hidden=s.next.hidden=s.menu.pages.length===1;s.count.hidden=s.menu.pages.length===1;s.count.textContent=(s.index+1)+' / '+s.menu.pages.length;const caption=s.menu.branch+' · '+title+' · '+this.copy[3]+' '+(s.index+1)+' / '+s.menu.pages.length;s.image.alt=caption;s.stage.setAttribute('aria-label',caption);if(s.loaded)s.status.textContent=caption;s.errText.textContent=this.copy[5];s.retry.textContent=this.copy[6];}
setLanguage(lang){this.lang=words[lang]?lang:'en';this.copy=words[this.lang];this.host.lang=this.lang;this.navTitle.textContent=this.copy[0];this.nav.setAttribute('aria-label',this.copy[0]);for(const s of this.cards.values())this.translate(s);}
}
const mapping={ubud:['ubud-food','ubud-western','ubud-drinks','ubud-desserts','ubud-shisha'],seminyak:['seminyak-food','seminyak-western','seminyak-drinks','seminyak-shisha'],nusapenida:['nusapenida-food','nusapenida-drinks','nusapenida-shisha'],phuket:['phuket-food'],club:['club-drinks-snacks','club-shisha']};
const readers=[];for(const host of document.querySelectorAll('[data-inline-menus]')){const ids=mapping[host.dataset.inlineMenus]||[],menus=ids.map(id=>window.BW_INLINE_MENUS?.menus?.[id]);if(!menus.length||menus.some(m=>!m?.pages?.length)){host.textContent='Menu unavailable. Please contact the team.';continue;}readers.push(new MenuReader(host,menus));}
document.addEventListener('bw:language',e=>readers.forEach(r=>r.setLanguage(e.detail?.language||locale())));
new MutationObserver(()=>readers.forEach(r=>{if(r.lang!==locale())r.setLanguage(locale());})).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
window.addEventListener('hashchange',()=>{for(const r of readers){const s=[...r.cards.values()].find(s=>location.hash==='#'+s.card.id);if(s)r.open(s.menu.id,true);}});
window.BW_MENU_M2={version:'M2-integrated',readers,menus:readers.flatMap(r=>r.menus.map(m=>({id:m.id,pages:m.pages.length}))),sourceArtworkUnchanged:true};
})();
