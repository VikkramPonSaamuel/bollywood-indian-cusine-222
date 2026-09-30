/* Checkpoint-specific progressive enhancements. No requests, tracking or submitted forms. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const all = (q) => Array.from(document.querySelectorAll(q));
  const off = () => reduce.matches || root.classList.contains('motion-paused');
  const slides = all('.restaurant-slide');
  let photo = 0, timer = null;
  function schedule() {
    clearTimeout(timer); timer = null;
    if (slides.length < 2 || off() || document.hidden) return;
    const hero = document.querySelector('.restaurant-hero');
    if (!hero || hero.getBoundingClientRect().bottom < 0) return;
    timer = setTimeout(() => {photo = (photo+1)%slides.length;slides.forEach((s,i)=>s.classList.toggle('active',i===photo));schedule();},7200);
  }
  new MutationObserver(schedule).observe(root,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',schedule);
  reduce.addEventListener('change',schedule);
  const hero=document.querySelector('.restaurant-hero');
  if (hero && 'IntersectionObserver' in window) new IntersectionObserver(schedule,{threshold:0}).observe(hero);
  schedule();
  const tabs=all('[data-food-tab]'), panels=all('[data-food-panel]');
  function choose(index,focus=false){tabs.forEach((t,i)=>{t.setAttribute('aria-selected',String(i===index));t.tabIndex=i===index?0:-1;});panels.forEach((p,i)=>p.hidden=i!==index);if(focus)tabs[index]?.focus();}
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>choose(i));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();choose(n,true);}});});
  const dialog=document.querySelector('#gallery-dialog');let galleryFocus=null;
  all('[data-gallery-open]').forEach(button=>button.addEventListener('click',()=>{if(!dialog?.showModal)return;galleryFocus=button;const img=document.querySelector('#gallery-full');img.src=button.dataset.galleryOpen;img.alt=button.dataset.galleryAlt||'';document.querySelector('#gallery-caption').textContent=button.querySelector('[data-i18n]')?.textContent||img.alt;document.body.classList.add('modal-open');dialog.showModal();}));
  dialog?.addEventListener('close',()=>galleryFocus?.focus({preventScroll:true}));
  if(!reduce.matches && 'IntersectionObserver' in window){root.classList.add('reveal06-ready');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('shown');observer.unobserve(e.target);}}),{threshold:.08});all('.reveal06').forEach(e=>observer.observe(e));}
  window.addEventListener('pagehide',()=>clearTimeout(timer));
  window.BW_CHECKPOINT={name:'Experience 06 / A',scope:'Restaurant opening + unified Night hero',get photo(){return photo},get visibleNightPanels(){return all('.night-panel').filter(e=>e.offsetWidth>0).length}};
})();
