/* Homepage gallery and decorative milestone interactions. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const off = () => reduce.matches || root.classList.contains('motion-paused');
  const rail = document.querySelector('.home-gallery-rail');
  const prev = document.querySelector('[data-gallery-prev]');
  const next = document.querySelector('[data-gallery-next]');
  const counter = document.querySelector('[data-gallery-count]');
  function railState() {
    if (!rail) return;
    const count = rail.children.length;
    const gap = parseFloat(getComputedStyle(rail).gap) || 24;
    const step = rail.firstElementChild.getBoundingClientRect().width + gap;
    const first = Math.min(count, Math.round(rail.scrollLeft / step) + 1);
    const shown = Math.max(1, Math.floor((rail.clientWidth + gap) / step));
    prev.disabled = rail.scrollLeft < 3;
    next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 3;
    counter.textContent = `${first}–${Math.min(count, first + shown - 1)} / ${count}`;
  }
  function shift(direction) {
    const gap = parseFloat(getComputedStyle(rail).gap) || 24;
    const step = rail.firstElementChild.getBoundingClientRect().width + gap;
    const shown = Math.max(1, Math.floor((rail.clientWidth + gap) / step));
    rail.scrollBy({left: direction * shown * step, behavior: off() ? 'instant' : 'smooth'});
  }
  prev?.addEventListener('click', () => shift(-1));
  next?.addEventListener('click', () => shift(1));
  rail?.addEventListener('scroll', railState, {passive:true});
  window.addEventListener('resize', railState, {passive:true});
  window.addEventListener('pageshow', railState);
  railState();
  const stats = [...document.querySelectorAll('.home-stat')];
  stats.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) stats.filter(other => other !== item).forEach(other => other.open = false);
    });
    item.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' && matchMedia('(hover:hover)').matches) item.open = true;
    });
    item.addEventListener('pointerleave', event => {
      if (event.pointerType === 'mouse' && !item.contains(document.activeElement)) item.open = false;
    });
    item.addEventListener('keydown', event => {
      if (event.key === 'Escape') {item.open = false; item.querySelector('summary').focus();}
    });
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.home-stats')) stats.forEach(item => item.open = false);
  });
  const timeline = document.querySelector('.home-timeline');
  const milestones = [...document.querySelectorAll('.home-milestone')];
  if (timeline && !off() && 'IntersectionObserver' in window) {
    timeline.classList.add('is-observed');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {entry.target.classList.add('in-view'); observer.unobserve(entry.target);}
      });
    }, {threshold:0.13});
    milestones.forEach(item => observer.observe(item));
  } else milestones.forEach(item => item.classList.add('in-view'));
  window.BW_HOME_BATCH = {
    version:'Home feedback 0001–0013 / H1',
    implementedRefs:[1,2,3,4,5,6,7,8,9,10,11],
    unchangedBlankRefs:[12,13],
    galleryItems:rail?.children.length || 0,
    historyYears:milestones.map(item => item.dataset.year),
    get motionPaused() {return off();}
  };
})();
