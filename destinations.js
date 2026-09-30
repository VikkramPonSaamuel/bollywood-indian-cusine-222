/* Five themed destinations. Real links first; animations are an optional enhancement. */
(() => {
 'use strict';
 const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const targets={ubud:'ubud.html',seminyak:'seminyak.html',nusapenida:'nusapenida.html',phuket:'thailand.html',club:'club.html'};
 document.querySelectorAll('[data-map-link]').forEach(a=>{const original=document.querySelector('[data-destination="'+a.dataset.mapLink+'"]');if(!original)return;a.dataset.destination=a.dataset.mapLink;const copy=document.createElement('span');copy.className='map-route-source';copy.hidden=true;copy.append(original.querySelector('.world-name').cloneNode(true),original.querySelector('.destination-scene').cloneNode(true));a.append(copy);});
 const cards=Array.from(document.querySelectorAll('a[data-destination]'));
 const off=()=>reduce.matches||root.classList.contains('motion-paused');
 let portal=null,activeLink=null,busy=false,navTimer=null,entryTimer=null;
 let stats={hovers:0,transitions:0,lastTheme:null,revision:3};
 function neutral(card){card.classList.remove('is-hovered','is-pressed');card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg');}
 function reset(){clearTimeout(navTimer);busy=false;if(portal){portal.classList.remove('is-open');portal.hidden=true;}cards.forEach(neutral);root.classList.remove('destination-leaving');}
 function cancel(){reset();try{sessionStorage.removeItem('bw-destination-entry');}catch{}activeLink?.focus({preventScroll:true});}
 function preference(){if(off()){cards.forEach(neutral);if(root.classList.contains('destination-arrival'))root.classList.remove('destination-arrival');}}
 new MutationObserver(preference).observe(root,{attributes:true,attributeFilter:['class']});
 reduce.addEventListener('change',preference);
 cards.forEach(card=>{
  let gesture=null;
  card.addEventListener('pointerenter',ev=>{if(ev.pointerType==='touch'||off())return;card.classList.add('is-hovered');stats.hovers++;});
  card.addEventListener('pointerleave',()=>neutral(card));
  card.addEventListener('focus',()=>{card.classList.add('is-focused');});
  card.addEventListener('blur',()=>{card.classList.remove('is-focused');neutral(card);});
  card.addEventListener('pointerdown',ev=>{gesture={x:ev.clientX,y:ev.clientY,type:ev.pointerType,moved:false};if(!off()&&ev.button===0)card.classList.add('is-pressed');},{passive:true});
  card.addEventListener('pointermove',ev=>{if(gesture&&Math.hypot(ev.clientX-gesture.x,ev.clientY-gesture.y)>12){gesture.moved=true;card.classList.remove('is-pressed');}if(ev.pointerType==='touch'||off()||!card.classList.contains('is-hovered'))return;const r=card.getBoundingClientRect();card.style.setProperty('--tilt-x',((.5-(ev.clientY-r.top)/r.height)*4).toFixed(2)+'deg');card.style.setProperty('--tilt-y',(((ev.clientX-r.left)/r.width-.5)*4).toFixed(2)+'deg');},{passive:true});
  card.addEventListener('pointerup',()=>card.classList.remove('is-pressed'),{passive:true});
  card.addEventListener('pointercancel',()=>{if(gesture)gesture.moved=true;neutral(card);},{passive:true});
  card.addEventListener('click',event=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||card.hasAttribute('download')||(card.target&&card.target!=='_self'))return;
   if(gesture?.type==='touch'&&gesture.moved){event.preventDefault();neutral(card);gesture=null;return;}
   gesture=null;const theme=card.dataset.destination,url=new URL(card.href,location.href);
   if(!targets[theme]||url.origin!==location.origin||url.pathname!==new URL(targets[theme],location.href).pathname||off())return;
   event.preventDefault();if(busy)return;
   activeLink=card;busy=true;stats.transitions++;stats.lastTheme=theme;
   try{
    if(!portal){portal=document.createElement('div');portal.className='destination-portal';portal.setAttribute('aria-hidden','true');portal.innerHTML='<div class="portal-backdrop"></div><div class="portal-effect"><i></i><i></i><i></i></div><div class="portal-inner"><div class="portal-scene"></div><span class="portal-kicker">Discover your Bollywood</span><strong class="portal-name"></strong><span class="portal-rule"></span></div>';document.body.append(portal);}
    const r=card.getBoundingClientRect(),x=event.detail?event.clientX:r.left+r.width/2,y=event.detail?event.clientY:r.top+r.height/2;
    portal.dataset.theme=theme;portal.style.setProperty('--origin-x',Math.max(0,Math.min(innerWidth,x))+'px');portal.style.setProperty('--origin-y',Math.max(0,Math.min(innerHeight,y))+'px');
    const scene=portal.querySelector('.portal-scene');scene.replaceChildren(card.querySelector('.destination-scene').cloneNode(true));
    portal.querySelector('.portal-name').textContent=card.querySelector('.world-name').textContent;
    portal.hidden=false;portal.classList.remove('is-open');void portal.offsetWidth;portal.classList.add('is-open');card.classList.add('is-pressed');root.classList.add('destination-leaving');
    const status=document.getElementById('destination-status');if(status)status.textContent='Opening '+card.querySelector('.world-name').textContent+'.';
    navTimer=setTimeout(()=>{try{sessionStorage.setItem('bw-destination-entry',JSON.stringify({theme,path:url.pathname,at:Date.now()}));}catch{}location.assign(url.href);},520);
   }catch(error){reset();location.assign(url.href);}
  });
 });
 document.addEventListener('keydown',event=>{if(busy&&event.key==='Escape'){event.preventDefault();cancel();}});
 window.addEventListener('pagehide',reset);window.addEventListener('pageshow',reset);
 try{const entry=JSON.parse(sessionStorage.getItem('bw-destination-entry')||'null');sessionStorage.removeItem('bw-destination-entry');if(entry&&targets[entry.theme]&&entry.path===location.pathname&&Date.now()-entry.at<12000&&!off()){root.dataset.theme=entry.theme;root.classList.add('destination-arrival');entryTimer=setTimeout(()=>{root.classList.remove('destination-arrival');delete root.dataset.theme;},1150);}}catch{}
 window.BW_DESTINATIONS={get busy(){return busy;},get reduced(){return off();},get state(){return {...stats};},count:cards.length};
})();
