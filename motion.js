// Website animations for the separate local preview only.
// No messages, bookings, network requests or data collection.
(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.cinema-hero');
  const slides = Array.from(document.querySelectorAll('[data-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-slide-to]'));
  const buttons = Array.from(document.querySelectorAll('[data-motion-toggle]'));
  const captions = ['Curries, colour & comfort', 'A taste of the tandoor',
    'South Indian favourites', 'Rice, spice & everything nice'];
  let active = 0;
  let timer = null;
  let userPaused = false; try { userPaused = localStorage.getItem('bw-motion-paused') === '1'; } catch (_) {}
  let hovered = false;
  let focused = false;
  let inView = true;
  let changes = 0;
  let explicitPlay = false;
  const disabled = () => userPaused || reduce.matches;
  function clearTimer() {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    hero?.classList.remove('autoplay-running');
  }
  function schedule() {
    clearTimer();
    const running = slides.length > 1 && !disabled() &&
      (explicitPlay || (!hovered && !focused)) && inView && !document.hidden;
    hero?.classList.toggle('is-idle', !running);
    if (!running) return;
    void hero.offsetWidth;
    hero.classList.add('autoplay-running');
    timer = setTimeout(() => showSlide(active + 1, false), 6500);
  }
  function showSlide(index, manual = true) {
    if (!slides.length) return;
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === active);
      slide.setAttribute('aria-hidden', String(i !== active));
    });
    dots.forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
    document.getElementById('slide-caption').textContent = captions[active];
    hero.dataset.current = String(active);
    changes++;
    if (manual) document.getElementById('slide-announcement').textContent =
      `Photo ${active + 1} of ${slides.length}: ${captions[active]}`;
    schedule();
  }
  function applyPreference() {
    root.classList.toggle('motion-enabled', !reduce.matches);
    root.classList.toggle('motion-paused', disabled());
    buttons.forEach(button => {
      button.disabled = reduce.matches;
      button.setAttribute('aria-pressed', String(disabled()));
      button.textContent = reduce.matches ? 'Reduced motion' :
        userPaused ? 'Resume motion' : 'Pause motion';
    });
    if (disabled()) document.querySelectorAll('.reveal-pending').forEach(
      element => element.classList.add('is-visible'));
    schedule();
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    userPaused = !userPaused; try { localStorage.setItem('bw-motion-paused', userPaused ? '1' : '0'); } catch (_) {}
    explicitPlay = !userPaused;
    applyPreference();
  }));
  reduce.addEventListener('change', applyPreference);
  if (hero && slides.length) {
    hero.querySelector('.slide-controls').hidden = false;
    hero.dataset.current = '0';
    hero.querySelector('[data-slide-prev]').addEventListener('click', () => showSlide(active - 1));
    hero.querySelector('[data-slide-next]').addEventListener('click', () => showSlide(active + 1));
    dots.forEach(button => button.addEventListener('click', () => showSlide(Number(button.dataset.slideTo))));
    hero.querySelector('.slide-controls').addEventListener('mouseenter', () => { hovered = true; explicitPlay = false; schedule(); });
    hero.querySelector('.slide-controls').addEventListener('mouseleave', () => { hovered = false; schedule(); });
    hero.addEventListener('focusin', () => { focused = true; explicitPlay = false; schedule(); });
    hero.addEventListener('focusout', () => setTimeout(() => {
      focused = hero.contains(document.activeElement);
      schedule();
    }, 0));
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      schedule();
    }, { threshold: 0.05 }).observe(hero);
  }
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('pagehide', clearTimer);
  window.addEventListener('pageshow', schedule);
  const header = document.querySelector('.site-header');
  let scrollScheduled = false;
  function updateHeader() {
    header?.classList.toggle('is-scrolled', scrollY > 20);
    scrollScheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(updateHeader); }
  }, { passive: true });
  updateHeader();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }), { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    const selector = '.section-heading,.destination,.flavour-card,.split-image,' +
      '.split-copy,.feature,.directory-card,.branch-image,.gathering .wrap';
    document.querySelectorAll(selector).forEach((element, i) => {
      element.classList.add('reveal-pending');
      element.style.setProperty('--reveal-delay', ((i % 3) * 65) + 'ms');
      if (disabled() || element.getBoundingClientRect().bottom < 0)
        element.classList.add('is-visible');
      else observer.observe(element);
    });
  }
  // Read-only state exposed for the local automated UI tests.
  window.BW_MOTION = {
    get current() { return active; }, get changes() { return changes; },
    get paused() { return disabled(); }, get reduced() { return reduce.matches; },
    get autoplay() { return timer !== null; }, revision: 2
  };
  applyPreference();
})();
