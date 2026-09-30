/* H3 shared presentation: original logo lockup and local, circular Night ripples. */
(() => {
  'use strict';
  if (window.BW_HEADER_H3) return;
  const root=document.documentElement,header=document.querySelector('header.header,header.site-header');
  if(!header)return;
  const original=new URL('assets/logo-original.png',document.baseURI).href;
  const brands=[...document.querySelectorAll('.brand')];
  brands.forEach(brand=>{
    const img=brand.querySelector('img.brand-logo,img.brand-mark');if(!img)return;
    brand.classList.add('bw-brand-lockup');
    const words=brand.querySelector('.brand-words');if(words){words.lang='en';words.setAttribute('translate','no');}
    let wrap=img.parentElement;
    if(!wrap.matches('.brand-mark-wrap,.bw-brand-orbit')){wrap=document.createElement('span');img.before(wrap);wrap.append(img);}
    wrap.classList.add('bw-brand-orbit');wrap.style.setProperty('--bw-logo-mask',`url("${original}")`);
    img.src=original;img.removeAttribute('srcset');img.width=340;img.height=268;
    if(!wrap.querySelector('.bw-brand-gold')){const gold=document.createElement('span');gold.className='bw-brand-gold';gold.setAttribute('aria-hidden','true');wrap.append(gold);}
  });
  header.querySelectorAll('.bw-header-waves,.nav-equalizer,.bw-ripple-field').forEach(n=>n.remove());
  header.classList.remove('bw-header-lane');header.classList.add('bw-header-radial');
  const links=[...header.querySelectorAll('nav a[href]')].filter(a=>{try{return new URL(a.getAttribute('href'),document.baseURI).pathname.endsWith('/club.html');}catch{return false;}});
  links.forEach(a=>{a.classList.remove('night-nav-link');a.classList.add('bw-night-target');});
  const field=document.createElement('div');field.className='bw-ripple-field';field.setAttribute('aria-hidden','true');
  const origin=document.createElement('div');origin.className='bw-ripple-origin';field.append(origin);
  const ns='http://www.w3.org/2000/svg';
  for(let i=0;i<4;i++){
    const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 108 108');svg.setAttribute('focusable','false');svg.classList.add('bw-night-ring');svg.style.setProperty('--ring-delay',`${-i*1.6}s`);
    const g=document.createElementNS(ns,'g'),p=document.createElementNS(ns,'path');const pts=[];
    for(let k=0;k<=144;k++){const a=k/144*Math.PI*2,r=43+1.2*Math.sin(a*7+i*.65)+.6*Math.sin(a*11-i*.3);pts.push(`${k?'L':'M'}${(54+r*Math.cos(a)).toFixed(2)},${(54+r*Math.sin(a)).toFixed(2)}`);}
    p.setAttribute('d',pts.join(' ')+' Z');g.append(p);svg.append(g);origin.append(svg);
  }
  header.prepend(field);root.dataset.brandHeader='h3';let scheduled=0,lastPlacement=null;
  function position(){
    scheduled=0;
    const anchor=links.find(a=>a.offsetWidth&&a.closest('.desktop-nav'))||links.find(a=>a.offsetWidth);
    if(!anchor){field.hidden=true;lastPlacement=null;return;}
    const range=document.createRange();range.selectNodeContents(anchor);const r=range.getBoundingClientRect(),h=header.getBoundingClientRect();
    if(!r.width||r.bottom<h.top||r.top>h.bottom){field.hidden=true;lastPlacement=null;return;}
    const x=r.left+r.width/2-h.left,y=r.top+r.height/2-h.top;field.hidden=false;
    field.style.setProperty('--bw-ripple-x',`${x.toFixed(2)}px`);field.style.setProperty('--bw-ripple-y',`${y.toFixed(2)}px`);
    lastPlacement={x,y,label:anchor.textContent.trim(),textWidth:r.width,headerWidth:h.width};
  }
  function queue(){if(!scheduled)scheduled=requestAnimationFrame(position);}
  links.forEach(a=>{a.addEventListener('pointerenter',()=>header.classList.add('bw-night-hover'));a.addEventListener('pointerleave',()=>header.classList.remove('bw-night-hover'));a.addEventListener('focus',()=>header.classList.add('bw-night-hover'));a.addEventListener('blur',()=>header.classList.remove('bw-night-hover'));});
  function visibility(){root.classList.toggle('bw-header-motion-off',document.hidden);}
  window.addEventListener('resize',queue,{passive:true});window.addEventListener('pageshow',()=>{visibility();queue();});
  document.addEventListener('bw:language',queue);document.addEventListener('visibilitychange',visibility);
  header.addEventListener('click',queue);header.addEventListener('change',queue);header.addEventListener('scroll',queue,true);
  if('ResizeObserver'in window){const observer=new ResizeObserver(queue);observer.observe(header);links.forEach(a=>observer.observe(a));}
  if('MutationObserver'in window){const observer=new MutationObserver(queue);header.querySelectorAll('.mobile-nav').forEach(n=>observer.observe(n,{attributes:true,attributeFilter:['hidden','class']}));}
  document.fonts?.ready.then(queue);visibility();position();
  window.BW_HEADER_H3={version:'H3',brandCount:brands.length,ringCount:4,get placement(){return lastPlacement;},scope:'Aligned brand and circular ripples anchored only to The Night; no header-wide lines or booking changes.'};
})();
