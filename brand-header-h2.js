/* Shared H2 enhancement; decorative only. No network calls, form submissions or tracking. */
(() => {
  'use strict';
  if (window.BW_HEADER_H2) return;
  const root = document.documentElement;
  const header = document.querySelector('header.header, header.site-header');
  if (!header) return;
  const originalLogo = new URL('assets/logo-original.png', document.baseURI).href;
  const brands = Array.from(document.querySelectorAll('.brand'));
  brands.forEach(brand => {
    const img = brand.querySelector('img.brand-logo, img.brand-mark');
    if (!img) return;
    let wrap = img.parentElement;
    if (!wrap.classList.contains('brand-mark-wrap') && !wrap.classList.contains('bw-brand-orbit')) {
      wrap = document.createElement('span');
      img.before(wrap); wrap.append(img);
    }
    wrap.classList.add('bw-brand-orbit');
    img.dataset.bwPreviousSource = img.getAttribute('src') || '';
    img.src = originalLogo; img.removeAttribute('srcset');
    wrap.style.setProperty('--bw-logo-mask', `url("${originalLogo}")`);
    if (!wrap.querySelector('.bw-brand-gold')) {
      const gold = document.createElement('span'); gold.className = 'bw-brand-gold';
      gold.setAttribute('aria-hidden', 'true'); wrap.append(gold);
    }
  });
  header.querySelectorAll('.nav-equalizer').forEach(el => el.remove());
  header.classList.add('bw-header-lane');
  const nightLinks = Array.from(header.querySelectorAll('nav a[href]')).filter(a => {
    try {return new URL(a.getAttribute('href'), document.baseURI).pathname.endsWith('/club.html');}
    catch (_) {return false;}
  });
  nightLinks.forEach(a => {a.classList.remove('night-nav-link');a.classList.add('bw-night-target');});
  const ns = 'http://www.w3.org/2000/svg';
  const wave = document.createElement('div');wave.className = 'bw-header-waves';wave.setAttribute('aria-hidden','true');
  const svg = document.createElementNS(ns,'svg');svg.classList.add('bw-wave-track');
  svg.setAttribute('viewBox','0 0 3200 100');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('focusable','false');
  const curves = [[16,66,0,'bw-wave-primary'],[21,65,1.1,'bw-wave-secondary'],[10,68,2.1,'bw-wave-accent']];
  curves.forEach(([amplitude,baseline,phase,className]) => {
    const p = document.createElementNS(ns,'path');p.setAttribute('class',className);
    const points = [];
    for(let x=0;x<=3200;x+=8){const y=baseline+amplitude*Math.sin(x*Math.PI/400+phase);points.push(`${x===0?'M':'L'}${x},${y.toFixed(2)}`);}
    p.setAttribute('d',points.join(' '));svg.append(p);
  });
  wave.append(svg);header.prepend(wave);
  root.dataset.brandHeader='h2';
  const row = header.querySelector('.header-row');
  let frame=0;
  function placeWaves(){
    frame=0;const bounds=header.getBoundingClientRect();const lane=row?.getBoundingClientRect();
    header.style.setProperty('--bw-lane-height',`${Math.round(lane?.height || 88)}px`);
    const anchor=nightLinks.find(a=>a.offsetWidth && a.closest('.desktop-nav')) || nightLinks.find(a=>a.offsetWidth);
    const rect=anchor?.getBoundingClientRect();
    const x=rect ? rect.left+rect.width/2-bounds.left : bounds.width*.72;
    header.style.setProperty('--bw-night-origin',`${Math.round(x)}px`);
  }
  function queueWaves(){if(!frame)frame=requestAnimationFrame(placeWaves);}
  function visibility(){root.classList.toggle('bw-header-motion-off',document.hidden);}
  window.addEventListener('resize',queueWaves,{passive:true});
  window.addEventListener('pageshow',()=>{visibility();queueWaves();});
  document.addEventListener('bw:language',queueWaves);
  document.addEventListener('visibilitychange',visibility);
  header.addEventListener('change',queueWaves);
  header.addEventListener('click',queueWaves);
  if('ResizeObserver' in window){const observer=new ResizeObserver(queueWaves);observer.observe(header);if(row)observer.observe(row);}
  document.fonts?.ready.then(queueWaves);
  visibility();placeWaves();
  window.BW_HEADER_H2={version:'H2',brandCount:brands.length,nightLinks:nightLinks.length,
    scope:'Shared logo and header waves only; original artwork, page content and booking destinations are unchanged.'};
})();
