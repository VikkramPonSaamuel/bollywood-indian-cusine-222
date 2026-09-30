/* N2: interactive seating + Google Sheet availability + Terms drawer. */
(() => {
  'use strict';
  const host = document.querySelector('[data-ny2027]');
  if (!host || window.BW_NY2027) return;
  const data = JSON.parse(document.querySelector('#ny-seat-data').textContent);
  const seats = new Map(data.seats.map(seat => [seat.id, {...seat, status:'CHECK'}]));
  const nodes = [...host.querySelectorAll('[data-seat]')];
  const card = host.querySelector('#ny-seat-card');
  const select = host.querySelector('#ny-seat-select');
  const plan = host.querySelector('.ny-plan');
  const scroll = host.querySelector('.ny-map-scroll');
  const close = host.querySelector('[data-ny-close]');
  const request = host.querySelector('[data-ny-request]');
  const statusBadge = host.querySelector('[data-ny-status]');
  const liveState = host.querySelector('[data-ny-live-state]');
  const terms = document.querySelector('[data-ny-terms]');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  let suppressFocus = false;
  let current = null, pinned = false, returnFocus = null;
  let hideTimer = 0, showTimer = 0, zoom = 1, lastSync = null;
  const money = number => 'IDR ' + Number(number).toLocaleString('en-US');
  const statusText = {AVAILABLE:'Available', HOLD:'On hold', BOOKED:'Booked', CHECK:'Check availability'};
  function text(selector, value) { const el=host.querySelector(selector); if(el) el.textContent=value; }
  function normalizeStatus(value){ const s=String(value||'').trim().toUpperCase(); return ['AVAILABLE','HOLD','BOOKED'].includes(s)?s:'CHECK'; }
  function updateSeatVisual(seat){
    const node=nodes.find(n=>n.dataset.seat===seat.id); if(!node) return;
    node.dataset.status=seat.status;
    const price=node.querySelector('.ny-label-price');
    if(price) price.textContent=seat.status==='BOOKED'?'BOOKED':seat.status==='HOLD'?'HOLD':seat.price?money(seat.price).replace('IDR ','').replace(/,000,000$/, 'M'):'';
    node.setAttribute('aria-label', `${seat.id}, ${seat.pax} guests, ${seat.price?money(seat.price):'price on request'}, ${statusText[seat.status]}`);
    const option=[...select.options].find(o=>o.value===seat.id); if(option) option.textContent=`${seat.id} — ${statusText[seat.status]}`;
  }
  function details(seat) {
    text('[data-ny-name]', seat.id); text('[data-ny-type]', seat.type);
    text('[data-ny-pax]', String(seat.pax)); text('[data-ny-price]', money(seat.price));
    text('[data-ny-location]', seat.location);
    statusBadge.textContent=statusText[seat.status]; statusBadge.dataset.status=seat.status;
    const message=['Hello Bollywood Indian Club Bali,','I would like to enquire about New Year 2027.','Seat: '+seat.id,'Guests: '+seat.pax,'Listed price: '+money(seat.price),'Current website status: '+statusText[seat.status],'Please confirm availability, inclusions and booking terms.'].join('\n');
    request.href='https://wa.me/'+data.phone+'?text='+encodeURIComponent(message);
    request.dataset.requestSeat=seat.id;
    request.hidden=seat.status==='BOOKED';
    request.firstChild.nodeValue=seat.status==='HOLD'?'Ask about this seat ':'Request this seat ';
    const note=card.querySelector('.ny-card-note');
    note.textContent=seat.status==='BOOKED'?'This seat is currently booked. Contact the Club team if you want an alternative.':seat.status==='HOLD'?'This seat is temporarily held. Contact the Club team to check whether it is released.':'Availability is updated from the Club booking sheet; final confirmation is from our team.';
  }
  function show(id, options={}) {
    const seat=seats.get(id); if(!seat) return;
    clearTimeout(hideTimer); clearTimeout(showTimer); current=id; pinned=Boolean(options.pin);
    nodes.forEach(node=>{ const active=node.dataset.seat===id; node.dataset.active=String(active); node.setAttribute('aria-expanded',String(active)); });
    select.value=id; details(seat); card.hidden=false; card.dataset.pinned=String(pinned);
    returnFocus=nodes.find(node=>node.dataset.seat===id);
    if(options.focus) close.focus({preventScroll:true});
  }
  function dismiss(focus=false) {
    clearTimeout(hideTimer); clearTimeout(showTimer); card.hidden=true; pinned=false; current=null;
    nodes.forEach(node=>{ delete node.dataset.active; node.setAttribute('aria-expanded','false'); });
    select.value='';
    if(focus){ suppressFocus=true; returnFocus?.focus({preventScroll:true}); suppressFocus=false; }
  }
  function scheduleHide(){ clearTimeout(showTimer); if(!pinned) hideTimer=setTimeout(()=>dismiss(),190); }
  nodes.forEach((node,i)=>{
    node.addEventListener('pointerenter',e=>{ if(fine.matches&&e.pointerType!=='touch'&&!pinned){ clearTimeout(hideTimer); clearTimeout(showTimer); showTimer=setTimeout(()=>show(node.dataset.seat),95); } });
    node.addEventListener('pointerleave',scheduleHide);
    node.addEventListener('click',()=>show(node.dataset.seat,{pin:true}));
    node.addEventListener('focus',()=>{ if(!pinned&&!suppressFocus) show(node.dataset.seat); });
    node.addEventListener('blur',e=>{ if(!card.contains(e.relatedTarget)&&!e.relatedTarget?.closest?.('[data-seat]')) scheduleHide(); });
    node.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); show(node.dataset.seat,{pin:true,focus:true}); }
      else if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'].includes(e.key)){
        e.preventDefault(); const j=e.key==='Home'?0:e.key==='End'?nodes.length-1:(i+(['ArrowDown','ArrowRight'].includes(e.key)?1:-1)+nodes.length)%nodes.length;
        pinned=false; nodes[j].focus(); show(nodes[j].dataset.seat);
      } else if(e.key==='Escape'){ e.preventDefault(); dismiss(true); }
    });
  });
  card.addEventListener('pointerenter',()=>clearTimeout(hideTimer));
  card.addEventListener('pointerleave',scheduleHide);
  card.addEventListener('focusin',()=>clearTimeout(hideTimer));
  close.addEventListener('click',()=>dismiss(true));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!card.hidden){ e.preventDefault(); dismiss(true); } });
  document.addEventListener('click',e=>{ if(!card.hidden&&!card.contains(e.target)&&!e.target.closest?.('[data-seat]')&&e.target!==select) dismiss(); });
  select.addEventListener('change',()=>{ if(select.value) show(select.value,{pin:true}); else dismiss(); });
  function scale(value){
    zoom=Math.max(1,Math.min(2.25,value)); plan.style.width=zoom===1?'100%':zoom*100+'%';
    host.querySelector('[data-ny-zoom="out"]').disabled=zoom===1; host.querySelector('[data-ny-zoom="in"]').disabled=zoom===2.25;
    if(zoom===1) scroll.scrollLeft=0;
  }
  host.querySelectorAll('[data-ny-zoom]').forEach(button=>button.addEventListener('click',()=>scale(button.dataset.nyZoom==='fit'?1:zoom+(button.dataset.nyZoom==='in'? .4 : -.4))));
  function parseCSV(text){
    const rows=[]; let row=[],field='',quoted=false;
    for(let i=0;i<text.length;i++){
      const ch=text[i];
      if(quoted){ if(ch==='"'&&text[i+1]==='"'){ field+='"'; i++; } else if(ch==='"') quoted=false; else field+=ch; }
      else if(ch==='"') quoted=true; else if(ch===','){ row.push(field); field=''; }
      else if(ch==='\n'){ row.push(field.replace(/\r$/,'')); rows.push(row); row=[]; field=''; } else field+=ch;
    }
    if(field||row.length){ row.push(field.replace(/\r$/,'')); rows.push(row); }
    return rows;
  }
  async function refreshAvailability(){
    if(!data.availabilityFeed){ liveState.textContent='Availability: confirm with Club'; return false; }
    liveState.textContent='Checking availability…';
    try{
      const url=data.availabilityFeed+(data.availabilityFeed.includes('?')?'&':'?')+'_='+Date.now();
      const response=await fetch(url,{cache:'no-store',credentials:'omit'}); if(!response.ok) throw new Error('HTTP '+response.status);
      const rows=parseCSV(await response.text()); const head=rows.shift().map(x=>x.trim().toLowerCase());
      const idCol=head.indexOf('seat id'),statusCol=head.indexOf('status'); if(idCol<0||statusCol<0) throw new Error('Missing columns');
      for(const row of rows){ const seat=seats.get(String(row[idCol]||'').trim()); if(!seat) continue; seat.status=normalizeStatus(row[statusCol]); updateSeatVisual(seat); }
      lastSync=new Date(); liveState.textContent='Availability updated'; liveState.dataset.live='true'; if(current) details(seats.get(current)); return true;
    }catch(error){
      liveState.textContent='Availability: confirm with Club'; liveState.dataset.live='false';
      for(const seat of seats.values()){ if(!['AVAILABLE','HOLD','BOOKED'].includes(seat.status)) seat.status='CHECK'; updateSeatVisual(seat); }
      if(current) details(seats.get(current)); return false;
    }
  }
  function openTerms(){ terms.hidden=false; document.body.classList.add('ny-terms-opened'); terms.querySelector('.ny-terms-panel').focus?.(); }
  function closeTerms(){ terms.hidden=true; document.body.classList.remove('ny-terms-opened'); }
  document.querySelector('[data-ny-terms-open]')?.addEventListener('click',openTerms);
  document.querySelectorAll('[data-ny-terms-close]').forEach(el=>el.addEventListener('click',closeTerms));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!terms.hidden) closeTerms(); });
  for(const seat of seats.values()) updateSeatVisual(seat);
  document.querySelectorAll('[data-motion-toggle]').forEach(button=>button.addEventListener('click',()=>{
    const paused=document.documentElement.classList.toggle('motion-paused'); button.textContent=paused?'Resume motion':'Pause motion'; button.setAttribute('aria-pressed',String(paused));
    try{ localStorage.setItem('bw-motion-paused',paused?'1':'0'); }catch{}
  }));
  scale(1); refreshAvailability();
  const interval=Math.max(30,Number(data.availabilityRefreshSeconds)||60)*1000; setInterval(refreshAvailability,interval);
  window.BW_NY2027={version:'N2',seats:[...seats.values()],get selected(){return current},get pinned(){return pinned},get zoom(){return zoom},get lastSync(){return lastSync},select:show,close:dismiss,refreshAvailability,availabilityLive:true,bookingSubmitted:false,phone:data.phone};
})();
