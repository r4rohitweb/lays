'use strict';

(() => {
  const packScene = document.querySelector('.newsletter-pack');
  const chilli = '<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M69 26C72 11 82 8 89 12" stroke="#438539" stroke-width="6" stroke-linecap="round"/><path d="M68 27C86 36 77 61 55 74C35 87 16 86 9 82C37 79 48 57 48 42C48 30 57 22 68 27Z" fill="url(#orbit-chilli)" stroke="#8f150c" stroke-width="1.5"/><path d="M58 34C68 32 69 42 64 52" stroke="#ffbc8677" stroke-width="4" stroke-linecap="round"/><path d="M57 28L67 22L77 30L69 34Z" fill="#4a852d"/></svg>';
  const chip = '<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M46 8C76 1 94 30 86 59C80 88 53 99 30 87C5 74 7 45 19 26C26 16 33 12 46 8Z" fill="url(#orbit-chip)" stroke="#d49c41" stroke-width="1.5"/><path d="M24 31C17 51 22 71 38 82M34 21C24 45 29 69 47 88M45 16C34 42 40 69 57 87M56 15C47 37 51 64 67 80M66 19C59 38 64 58 76 67" stroke="#fff0ad" stroke-opacity=".65" stroke-width="2"/><path d="M29 29L30 30M54 65L55 66M63 32L64 33M35 65L36 66" stroke="#a9642580" stroke-width="3" stroke-linecap="round"/></svg>';
  const orbits = document.createElement('div'); orbits.className = 'flavor-orbits';
  orbits.setAttribute('aria-hidden', 'true');
  orbits.innerHTML = '<svg class="orbit-defs" width="0" height="0" aria-hidden="true"><defs><linearGradient id="orbit-chilli" x1="26" y1="24" x2="73" y2="80" gradientUnits="userSpaceOnUse"><stop stop-color="#ff782f"/><stop offset=".4" stop-color="#e72c16"/><stop offset="1" stop-color="#8d090d"/></linearGradient><radialGradient id="orbit-chip" cx=".3" cy=".25" r=".8"><stop stop-color="#ffecaa"/><stop offset=".55" stop-color="#ebbf65"/><stop offset="1" stop-color="#b67625"/></radialGradient></defs></svg>' + [0, 1, 2].map(index => '<div class="flavor-orbit flavor-orbit-' + index + '"><span class="orbit-ingredient orbit-chilli">' + chilli + '</span><span class="orbit-ingredient orbit-crisp">' + chip + '</span></div>').join('');
  packScene.prepend(orbits);
  const orbitVisibility = new IntersectionObserver(entries => {
    packScene.classList.toggle('orbits-visible', entries[0].isIntersecting);
  }, { rootMargin: '80px' });
  orbitVisibility.observe(packScene);
  const form = document.querySelector('.newsletter-form');
  const status = document.querySelector('.newsletter-status');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    status.textContent = 'THANKS FOR TRYING THE CONCEPT. NO SUBSCRIPTION HAS BEEN CREATED.';
    form.reset();
  });
  const header = document.querySelector('.header');
  const ending = document.querySelector('#join');
  const update = () => header.classList.toggle('on-footer', ending.getBoundingClientRect().top <= 110);
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
})();
