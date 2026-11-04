'use strict';

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const flavors = [
    { id: 'classic', name: 'Classic', tag: 'THE ORIGINAL GOOD MOOD', color: '#e6ba21', ink: '#25200c', note: 'Simple. Golden. Always a good idea.' },
    { id: 'sour', name: 'Sour Cream & Onion', tag: 'A LITTLE TANG. A LOT TO LOVE.', color: '#39a34e', ink: '#f0f2d5', note: 'A creamy tang and a savory crunch.' },
    { id: 'bbq', name: 'Barbecue', tag: 'BRING THE BACKYARD VIBES', color: '#9b3525', ink: '#ffe4a1', note: 'Smoky, savory, and ready to share.' },
    { id: 'vinegar', name: 'Salt & Vinegar', tag: 'A BRIGHT LITTLE WAKE-UP CALL', color: '#179ed9', ink: '#f4f0dd', note: 'A tangy twist on a golden classic.' },
    { id: 'flamin', name: "Flamin’ Hot", tag: 'TURN UP THE HEAT', color: '#e51e32', ink: '#fff0d4', note: 'A fiery kick with a bold crunch.' },
    { id: 'onion', name: 'Cheddar & Sour Cream', tag: 'CHEESY. TANGY. HAPPY.', color: '#eb8f21', ink: '#49240d', note: 'Cheddar meets a sour cream tang.' },
    { id: 'dressed', name: 'All Dressed', tag: 'A LITTLE BIT OF EVERYTHING', color: '#7247a7', ink: '#fff0d4', note: 'Sweet, savory, and tangy in one bite.' },
    { id: 'southern', name: 'Sweet Southern Heat Barbecue', tag: 'SWEET MEETS A LITTLE HEAT', color: '#a62035', ink: '#ffe2ac', note: 'Southern barbecue sweetness with a spicy kick.' },
    { id: 'bacon', name: 'Bacon Grilled Cheese', tag: 'YOUR COMFORT FOOD CRUNCH', color: '#e6b449', ink: '#452609', note: 'Smoky bacon meets savory cheese.' }
  ];
  const byId = Object.fromEntries(flavors.map(flavor => [flavor.id, flavor]));
  const image = (flavor, lazy = true) => `<img src="assets/${flavor.id}.png" alt="Lay’s ${flavor.name} potato chips" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} draggable="false">`;
  const carousel = $('.carousel');
  const hero = $('#flavors');
  const inside = $('#inside');
  const header = $('.header');
  let selected = 0, auto = !motion.matches, autoTimer, userInteracting = false, titleTimer;
  let sceneProgress = 0, targetProgress = 0, currentChapter = -1, lastScroll = scrollY, scrollVelocity = 0;
  let heroStart = 0, heroTravel = 1, insideStart = 0, insideTravel = 1;
  let bundle = [], basket = [], toastTimer, soundOn = false, audio;

  // All imagery is local; the only third-party request is optional typography.
  $('#carousel-packs').innerHTML = flavors.map((flavor, index) => `<button class="carousel-pack" data-carousel="${index}" aria-label="Select ${flavor.name}" aria-pressed="${index === 0}" style="--float-delay:-${index}s">${image(flavor, false)}</button>`).join('');
  $('#flavor-dots').innerHTML = flavors.map((flavor, index) => `<button data-dot="${index}" aria-label="Show ${flavor.name}" aria-pressed="${index === 0}"></button>`).join('');
  $('#shop-grid').innerHTML = flavors.map(flavor => `<article class="shop-card" style="--card-color:${flavor.color};--card-ink:${flavor.ink}"><h3>${flavor.name.toUpperCase()}</h3><button class="card-image" aria-label="Poke the ${flavor.name} bag">${image(flavor)}<span class="poke-hint" aria-hidden="true">POKE ME</span></button><div class="card-bottom"><p>${flavor.note}</p><button class="add-bag" data-add="${flavor.id}" aria-label="Add ${flavor.name} to your three-pack"><span class="add-label">ADD TO BOX</span><span class="add-symbol" aria-hidden="true">+</span></button></div></article>`).join('');
  $('#builder-options').innerHTML = flavors.map(flavor => `<button class="builder-option" data-pick="${flavor.id}" aria-label="Add ${flavor.name} to your three-pack"><span>${flavor.name.toUpperCase()}</span>${image(flavor)}<b>+</b></button>`).join('');
  const railImage = (flavor, face) => flavor.id === 'flamin' ? 'assets/flamin' + (face === 'back' ? '-back' : '') + '.png' : 'assets/rail/' + flavor.id + '-' + face + '.png';
  $('#range-track').innerHTML = Array.from({ length: 7 }, () => flavors).flat().map((flavor, index) => `<div class="rail-item"${Math.floor(index / flavors.length) !== 2 ? ' aria-hidden="true"' : ''}><button class="rail-bag" data-rail-flavor="${flavor.id}" aria-label="Show back of ${flavor.name} packet" aria-pressed="false"${Math.floor(index / flavors.length) !== 2 ? ' tabindex="-1"' : ''} style="--swing:${index % flavors.length % 2 ? 3 : -3}deg"><span class="rail-flip"><img class="rail-front" src="${railImage(flavor, 'front')}" alt="Lay&#8217;s ${flavor.name} packet front" loading="lazy" draggable="false"><img class="rail-back" src="${railImage(flavor, 'back')}" alt="Lay&#8217;s ${flavor.name} original packet back" aria-hidden="true" loading="lazy" draggable="false"></span><span class="rail-hook" aria-hidden="true"></span></button><h3>${flavor.name.toUpperCase()}</h3><span class="micro">0${index % flavors.length + 1} / ${flavor.tag}</span></div>`).join('');

  function setFlavor(index, immediate = false) {
    selected = (index + flavors.length) % flavors.length;
    const flavor = flavors[selected];
    document.documentElement.style.setProperty('--scene', flavor.color);
    document.documentElement.style.setProperty('--scene-ink', flavor.ink);
    $('meta[name="theme-color"]').content = flavor.color;
    $$('.carousel-pack').forEach((pack, i) => {
      let offset = (i - selected + flavors.length) % flavors.length;
      if (offset > flavors.length / 2) offset -= flavors.length;
      const distance = Math.abs(offset), mobile = innerWidth <= 760;
      const spacing = innerWidth * (mobile ? .39 : .145);
      pack.style.transform = `translate(-50%,-50%) translate3d(${offset * spacing}px,${distance * (mobile ? 20 : 27)}px,${-distance * 170}px) rotateY(${-offset * 19}deg) rotateZ(${offset * 9}deg) scale(${1 - distance * .07})`;
      pack.style.zIndex = String(10 - distance);
      pack.style.opacity = distance > 1 && mobile ? '.45' : '1';
      pack.classList.toggle('is-active', i === selected);
      pack.setAttribute('aria-pressed', String(i === selected));
    });
    $$('[data-dot]').forEach((dot, i) => { dot.classList.toggle('active', i === selected); dot.setAttribute('aria-pressed', String(i === selected)); });
    $('.flavor-counter').textContent = `0${selected + 1}`;
    $('.hero-flavor-copy>.micro').textContent = flavor.tag;
    clearTimeout(titleTimer);
    const title = $('#flavor-title');
    if (!immediate && !motion.matches) title.classList.add('changing');
    titleTimer = setTimeout(() => { title.textContent = flavor.name.toUpperCase(); title.classList.remove('changing'); }, immediate || motion.matches ? 0 : 130);
  }
  function tickSound() {
    if (!soundOn || !audio) return;
    if (audio.state === 'suspended') audio.resume();
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.type = 'triangle'; oscillator.frequency.setValueAtTime(180 + selected * 35, audio.currentTime); oscillator.frequency.exponentialRampToValueAtTime(60, audio.currentTime + .09);
    gain.gain.setValueAtTime(.045, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .1);
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + .11);
  }
  function restartAuto() {
    clearInterval(autoTimer);
    if (auto && !motion.matches) autoTimer = setInterval(() => { if (!document.hidden && scrollY < hero.offsetHeight - innerHeight * .8 && !userInteracting) { setFlavor(selected + 1); } }, 3700);
    $('#autoplay-toggle').setAttribute('aria-pressed', String(auto && !motion.matches));
    $('#autoplay-toggle').innerHTML = `<span>${auto && !motion.matches ? 'Ⅱ' : '▷'}</span> AUTOPLAY`;
  }
  function chooseFlavor(index) { setFlavor(index); tickSound(); restartAuto(); }
  $('#previous-flavor').addEventListener('click', () => chooseFlavor(selected - 1));
  $('#next-flavor').addEventListener('click', () => chooseFlavor(selected + 1));
  $$('[data-carousel]').forEach(button => button.addEventListener('click', () => { if (!carouselDragged) chooseFlavor(Number(button.dataset.carousel)); }));
  $$('[data-dot]').forEach(button => button.addEventListener('click', () => chooseFlavor(Number(button.dataset.dot))));
  $('#autoplay-toggle').addEventListener('click', () => { auto = !auto; restartAuto(); });
  $('#hero-explore').addEventListener('click', () => inside.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth' }));
  carousel.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); chooseFlavor(selected + (event.key === 'ArrowRight' ? 1 : -1)); } });
  let carouselX = null, carouselDragged = false;
  carousel.addEventListener('pointerdown', event => { carouselX = event.clientX; carouselDragged = false; userInteracting = true; });
  carousel.addEventListener('pointermove', event => { if (carouselX !== null && Math.abs(event.clientX - carouselX) > 15) carouselDragged = true; });
  window.addEventListener('pointerup', event => { if (carouselX !== null && Math.abs(event.clientX - carouselX) > 40) chooseFlavor(selected + (event.clientX < carouselX ? 1 : -1)); carouselX = null; userInteracting = false; setTimeout(() => { carouselDragged = false; }, 0); });
  carousel.addEventListener('pointercancel', () => { carouselX = null; userInteracting = false; carouselDragged = false; });
  carousel.addEventListener('pointerenter', () => { if (finePointer.matches) userInteracting = true; });
  carousel.addEventListener('pointerleave', () => { if (carouselX === null) userInteracting = false; });
  carousel.addEventListener('focusin', () => { userInteracting = true; });
  carousel.addEventListener('focusout', () => { userInteracting = false; });
  $('#sound-toggle').addEventListener('click', () => {
    const AudioClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioClass) { notify('Sound is unavailable in this browser.'); return; }
    if (!audio) audio = new AudioClass();
    soundOn = !soundOn; $('#sound-toggle').setAttribute('aria-pressed', String(soundOn)); $('#sound-toggle b').textContent = soundOn ? 'ON' : 'OFF'; tickSound();
  });

  // The short opening sequence can always be skipped or replayed.
  const intro = $('.intro'); let introTimer;
  function finishIntro() { window.CrunchIntro.stop(); const focused = intro.contains(document.activeElement); intro.classList.add('done'); intro.inert = true; $('.header').inert = false; $('main').inert = false; $('.skip-link').inert = false; clearTimeout(introTimer); if (focused) $('#next-flavor').focus({ preventScroll: true }); }
  function playIntro() { if (motion.matches) { finishIntro(); return; } intro.inert = false; $('.header').inert = true; $('main').inert = true; $('.skip-link').inert = true; intro.classList.remove('done'); window.CrunchIntro.play(); clearTimeout(introTimer); introTimer = setTimeout(finishIntro, 3200); }
  $('.skip-intro').addEventListener('click', finishIntro);
  $('#replay-intro').addEventListener('click', () => { scrollTo({ top: 0, behavior: 'instant' }); playIntro(); });
  playIntro();

  // Native scrolling drives the sticky stage. No wheel interception or scroll lock.
  const pouch = new window.CrunchPouch($('#pouch-canvas'), 'assets/flamin.png', 'assets/flamin-back.png');
  const chips = Array.from({ length: innerWidth <= 760 ? 70 : 130 }, (_, i) => {
    const element = document.createElement('span'); element.className = 'flying-chip';
    const seed = (Math.sin((i + 1) * 127.1) * 43758.5453) % 1;
    const size = 16 + Math.abs(seed) * 86;
    element.style.setProperty('--size', `${size}px`); $('.chip-storm').append(element);
    return { element, angle: i * 2.39996, radius: .14 + Math.abs(seed) * .76, depth: Math.sin(i * 3.1), phase: i * .9 };
  });
  const chapters = [
    { title: 'BUILT TO<br>PROTECT.', label: 'THE GOOD STUFF', number: '01 / THE BAG', callout: 'Big flavor.<br>A fiery crunch.<br>Ready to go.' },
    { title: 'GOOD THINGS<br>START IN<br>THE GROUND.', label: 'KEEP IT REAL', number: '02 / THE POTATO', callout: 'Whole potatoes.<br>A golden beginning.' },
    { title: 'CUT<br>PAPER-THIN.', label: 'A DIFFERENT PERSPECTIVE', number: '03 / THE CRUNCH', callout: 'Thin slices.<br>A big crunch.' },
    { title: 'FLAMIN’<br>HOT.', label: 'TURN UP THE HEAT', number: '04 / THE HEAT', callout: 'A fiery kick.<br>A whole lot<br>of flavor.' }
  ];
  function measure() { heroStart = hero.offsetTop; heroTravel = Math.max(1, hero.offsetHeight - innerHeight); insideStart = inside.offsetTop; insideTravel = Math.max(1, inside.offsetHeight - innerHeight); setFlavor(selected, true); updateScroll(); }
  function updateScroll() {
    const y = scrollY;
    targetProgress = clamp((y - insideStart) / insideTravel);
    scrollVelocity = Math.max(scrollVelocity, Math.abs(y - lastScroll)); lastScroll = y;
    const heroProgress = clamp((y - heroStart) / heroTravel);
    if (heroProgress > .03 && heroProgress < 1 && !motion.matches) { const index = Math.min(flavors.length - 1, Math.floor(heroProgress * flavors.length)); if (index !== selected) setFlavor(index); }
    const insideActive = y + 110 >= insideStart && y < insideStart + inside.offsetHeight - 110;
    const paperActive = y >= insideStart + inside.offsetHeight - 110 && y < $('#join').offsetTop - 110;
    header.classList.toggle('on-dark', insideActive);
    header.classList.toggle('on-paper', paperActive);
    let active = 'flavors';
    for (const id of ['flavors','inside','shop','range','qa','join']) if (y + innerHeight * .3 >= $(`#${id}`).offsetTop) active = id;
    $$('.nav a').forEach(link => link.classList.toggle('active', link.hash === `#${active}`));
  }
  addEventListener('scroll', updateScroll, { passive: true });
  addEventListener('resize', measure, { passive: true });
  $$('[data-chapter]').forEach(button => button.addEventListener('click', () => { const chapter = Number(button.dataset.chapter); scrollTo({ top: insideStart + (chapter === 3 ? .95 : (chapter + .12) / 3.35) * insideTravel, behavior: motion.matches ? 'instant' : 'smooth' }); }));
  let pointerX = 0, pointerY = 0;
  $('.inside-stage').addEventListener('pointermove', event => { if (finePointer.matches) { pointerX = (event.clientX / innerWidth - .5) * .16; pointerY = (event.clientY / innerHeight - .5) * .12; } });
  $('.inside-stage').addEventListener('pointerleave', () => { pointerX = pointerY = 0; });
  let lastFrame = 0;
  function frame(time) {
    requestAnimationFrame(frame);
    if (document.hidden || time - lastFrame < 25) return;
    const dt = Math.min((time - lastFrame) / 1000, .1); lastFrame = time;
    const inView = scrollY + innerHeight >= insideStart && scrollY <= insideStart + inside.offsetHeight;
    if (!inView) return;
    sceneProgress += (targetProgress - sceneProgress) * (motion.matches ? 1 : Math.min(1, dt * 11));
    if (Math.abs(targetProgress - sceneProgress) < .0001) sceneProgress = targetProgress;
    const p = sceneProgress, t = motion.matches ? 0 : time / 1000;
    const chapter = Math.min(3, Math.floor(p * 3.35));
    if (chapter !== currentChapter) {
      currentChapter = chapter; const text = chapters[chapter];
      $('#inside-title').innerHTML = text.title; $('#inside-label').textContent = text.label;
      $('#callout-number').textContent = text.number; $('#callout-text').innerHTML = text.callout;
      $('.inside-number').textContent = `0${chapter + 1}`;
      $$('[data-chapter]').forEach((button, i) => { button.classList.toggle('active', i === chapter); button.setAttribute('aria-pressed', String(i === chapter)); });
    }
    const storm = clamp((p - .66) / .25), angle = motion.matches ? -.18 : p * Math.PI * 6 - .18 + storm * .9;
    const stage = $('.inside-stage');
    stage.style.setProperty('--storm', String(storm));
    stage.classList.toggle('storm-active', storm > .8);
    const landingTurn = clamp((p - .95) / .05);
    const rotation = [motion.matches ? .04 : (Math.sin(p * Math.PI * 3) * .18 + pointerY) * (1 - landingTurn), (angle + pointerX) * (1 - landingTurn) + Math.PI * 6 * landingTurn, (-.13 + Math.sin(p * Math.PI * 4) * .16) * (1 - landingTurn) - .12 * landingTurn];
    pouch.draw(rotation, (innerWidth <= 760 ? .94 : 1.03) - storm * .32);
    $('.fallback-bag').style.setProperty('--bag-turn', `${angle * 180 / Math.PI}deg`);
    const pouchStage = $('.pouch-stage');
    pouchStage.style.left = innerWidth <= 760 ? '-12%' : `${26 - storm * 6}%`;
    pouchStage.style.right = innerWidth <= 760 ? '-12%' : `${12 + storm * 8}%`;
    pouchStage.style.top = innerWidth <= 760 ? `${35 - storm * 23}%` : '8%';
    pouchStage.style.transform = `translateY(${(innerWidth <= 760 ? -90 * clamp(p * 5) * (1 - storm) : 0) + (motion.matches ? 0 : Math.sin(t * 1.2) * 5)}px)`;
    $('.inside-copy').style.opacity = String(1 - storm);
    $('.inside-copy').style.transform = `translateY(${-storm * 40}px)`;
    $('.inside-callout').style.opacity = String(1 - storm);
    $('.scroll-progress>span').style.width = `${p * 100}%`;
    $('#spin-speed').textContent = storm > .2 ? `SPIN SPEED ${(Math.min(scrollVelocity, 200) * .31 + 1.2).toFixed(1)} CHIPS / SEC` : 'TAKE A CLOSER LOOK';
    scrollVelocity *= .86;
    chips.forEach((chip, index) => {
      const distance = chip.radius * (0.55 + storm * .25), spin = chip.angle + p * 5.8 + t * .08;
      const x = Math.cos(spin) * innerWidth * distance, y = Math.sin(spin) * innerHeight * distance * 1.3 + Math.sin(t * .6 + chip.phase) * 18;
      // A clear center keeps the product readable while foreground chips pass around it.
      const centerMask = storm > .5 && Math.abs(x) < innerWidth * .115 && Math.abs(y) < innerHeight * .27 ? .12 : 1;
      const opacity = clamp((p - .03) * 4) * (.12 + storm * .88) * centerMask;
      chip.element.style.opacity = motion.matches ? '0' : String(opacity);
      chip.element.style.transform = `translate3d(${x}px,${y}px,${chip.depth * 280}px) rotateX(${p * 360 + index * 29}deg) rotateY(${p * 240 + index * 37}deg) rotateZ(${t * 8 + index * 41}deg) scale(${.5 + storm * (.7 + Math.max(0, chip.depth) * .5)})`;
      chip.element.style.filter = chip.depth > .6 && storm > .5 ? 'blur(2.5px)' : 'none';
    });
  }
  requestAnimationFrame(frame);

  // A synchronized three-pack builder, with local-only concept basket state.
  const mixTray = document.createElement('a');
  mixTray.className = 'mix-tray'; mixTray.href = '#builder'; mixTray.hidden = true;
  mixTray.innerHTML = '<span class="mix-tray-bags" aria-hidden="true"></span><span class="mix-tray-label" role="status" aria-live="polite"></span><span aria-hidden="true">↗</span>';
  document.body.append(mixTray);
  let builderVisible = false;
  new IntersectionObserver(entries => { builderVisible = entries[0].isIntersecting; mixTray.hidden = builderVisible || bundle.length === 0; }, { threshold: .1 }).observe($('#builder'));
  function flyBag(source, target, flavor) {
    if (!source || !target || motion.matches) return;
    const from = source.getBoundingClientRect(), to = target.getBoundingClientRect();
    if (!from.width || !to.width) return;
    const ghost = document.createElement('img'); ghost.src = `assets/${flavor}.png`; ghost.alt = ''; ghost.className = 'bag-to-box'; ghost.setAttribute('aria-hidden', 'true');
    const size = Math.min(from.width, 125);
    ghost.style.cssText = `width:${size}px;height:${size * 1.4}px;left:${from.left + from.width / 2 - size / 2}px;top:${from.top + from.height / 2 - size * .7}px`;
    document.body.append(ghost);
    const dx = to.left + to.width / 2 - from.left - from.width / 2, dy = to.top + to.height / 2 - from.top - from.height / 2;
    const animation = ghost.animate([{ transform: 'translate(0,0) rotate(-8deg) scale(1)', opacity: 1 }, { transform: `translate(${dx * .45}px,${dy * .25 - 70}px) rotate(12deg) scale(.8)`, opacity: 1, offset: .45 }, { transform: `translate(${dx}px,${dy}px) rotate(-10deg) scale(.15)`, opacity: .2 }], { duration: 650, easing: 'cubic-bezier(.35,0,.35,1)' });
    animation.finished.then(() => { ghost.remove(); target.animate([{ scale: 1 }, { scale: 1.08 }, { scale: 1 }], { duration: 250 }); }, () => ghost.remove());
  }
  try { basket = JSON.parse(localStorage.getItem('crunch-lab-basket') || '[]').filter(id => byId[id]).slice(0, 99); } catch { basket = []; }
  function notify(message) { clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('show'); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3000); }
  function renderBundle() {
    const previousSlots = $$('.pack-slot');
    for (let index = 0; index < 3; index++) {
      const id = bundle[index], previous = previousSlots[index];
      if (previous && previous.dataset.flavor === (id || '')) continue;
      const slot = document.createElement('div'); slot.className = `pack-slot${id ? ' filled' : ''}`; slot.dataset.flavor = id || '';
      if (id) {
        slot.innerHTML = `${image(byId[id], false)}<button class="remove-slot" aria-label="Remove ${byId[id].name} from slot ${index + 1}">×</button>`;
        $('.remove-slot', slot).addEventListener('click', () => { bundle.splice(index, 1); renderBundle(); });
      } else slot.innerHTML = `<span class="slot-number">${index + 1}</span>`;
      if (previous) previous.replaceWith(slot); else $('#pack-slots').append(slot);
    }
    $$('[data-pick]').forEach(button => { const selected = bundle.includes(button.dataset.pick); button.classList.toggle('selected', selected); button.disabled = selected; $('b', button).textContent = selected ? '✓' : '+'; button.setAttribute('aria-pressed', String(selected)); button.setAttribute('aria-label', selected ? `${byId[button.dataset.pick].name} already in your box; remove the bag to choose it again` : `Add ${byId[button.dataset.pick].name} to your three-pack`); });
    $$('[data-add]').forEach(button => { const count = bundle.filter(id => id === button.dataset.add).length; button.classList.toggle('selected', count > 0); $('.add-symbol', button).textContent = count ? '×' : '+'; $('.add-label', button).textContent = 'ADD TO BOX'; button.setAttribute('aria-pressed', String(count > 0)); button.setAttribute('aria-label', count ? `Remove ${byId[button.dataset.add].name} from your three-pack` : `Add ${byId[button.dataset.add].name} to your three-pack`); button.closest('.shop-card').classList.toggle('in-box', count > 0); });
    $('.mix-tray-bags', mixTray).innerHTML = bundle.map(id => image(byId[id], false)).join('');
    $('.mix-tray-label', mixTray).textContent = `YOUR THREE-PACK · ${bundle.length} / 3 · VIEW BOX`;
    mixTray.hidden = builderVisible || bundle.length === 0;
    $('#add-bundle').disabled = bundle.length !== 3; $('#add-bundle>span').textContent = bundle.length === 3 ? 'ADD TO BASKET' : `PICK ${3 - bundle.length} ${bundle.length === 2 ? 'MORE' : 'BAGS'}`;
    $('#bundle-progress').textContent = `${bundle.length} / 3`;
  }
  function addBag(id, source) { if (bundle.includes(id)) { notify('THAT FLAVOR IS ALREADY IN YOUR BOX. PICK A DIFFERENT ONE.'); return; } if (bundle.length >= 3) { notify('YOUR BOX IS FULL. REMOVE A BAG TO SWAP A FLAVOR.'); return; } bundle.push(id); renderBundle(); tickSound(); if (source) { const card = source.closest('.shop-card'); card.classList.remove('just-added'); void card.offsetWidth; card.classList.add('just-added'); flyBag($('.card-image img', card), builderVisible ? $('#pack-slots') : mixTray, id); } else notify(`${byId[id].name.toUpperCase()} — IN YOUR BOX · ${bundle.length} / 3`); }
  $$('[data-add]').forEach(button => button.addEventListener('click', () => { const id = button.dataset.add; if (bundle.includes(id)) { bundle = bundle.filter(selectedId => selectedId !== id); renderBundle(); tickSound(); notify(`${byId[id].name.toUpperCase()} — REMOVED FROM YOUR BOX`); } else addBag(id, button); }));
  $$('[data-pick]').forEach(button => button.addEventListener('click', () => addBag(button.dataset.pick)));
  $('#add-bundle').addEventListener('click', () => { if (bundle.length !== 3) return; if (basket.length > 96) { notify('YOUR CONCEPT BASKET IS FULL. CLEAR IT TO START AGAIN.'); return; } flyBag($('.pack-slot img'), $('#basket-toggle'), bundle[0]); basket.push(...bundle); bundle = []; renderBundle(); saveBasket(); notify('THREE GOOD CHOICES. ADDED TO YOUR CONCEPT BASKET.'); tickSound(); });
  function saveBasket() { try { localStorage.setItem('crunch-lab-basket', JSON.stringify(basket)); } catch { /* Works in memory when storage is unavailable. */ } renderBasket(); }
  function renderBasket() {
    $('#basket-count').textContent = basket.length;
    $('#basket-toggle').setAttribute('aria-label', `Open concept basket, ${basket.length} bags`);
    const counts = flavors.map(flavor => ({ ...flavor, count: basket.filter(id => id === flavor.id).length })).filter(flavor => flavor.count);
    $('#basket-items').innerHTML = counts.length ? counts.map(flavor => `<div class="basket-row">${image(flavor, false)}<div><p>${flavor.name}</p><span>${flavor.count} ${flavor.count === 1 ? 'BAG' : 'BAGS'}</span></div><button data-remove-basket="${flavor.id}" aria-label="Remove one ${flavor.name} bag">−</button></div>`).join('') : '<p class="basket-empty">Your next good moment starts with a bag.<br>Build a three-pack to fill your basket.</p>';
    $$('[data-remove-basket]').forEach(button => button.addEventListener('click', () => { const index = basket.indexOf(button.dataset.removeBasket); if (index >= 0) basket.splice(index, 1); saveBasket(); }));
    $('#clear-basket').disabled = basket.length === 0;
  }
  const dialog = $('#basket-dialog');
  $('#basket-toggle').addEventListener('click', () => { dialog.showModal(); document.body.style.overflow = 'hidden'; });
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
  dialog.addEventListener('click', event => { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); });
  $('#clear-basket').addEventListener('click', () => { basket = []; saveBasket(); });
  renderBundle(); renderBasket();

  // Physical card tilts and elastic presses, with touch and keyboard equivalents.
  $$('.shop-card').forEach(card => {
    card.addEventListener('pointermove', event => { if (!finePointer.matches || motion.matches) return; const rect = card.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width - .5, y = (event.clientY - rect.top) / rect.height - .5; card.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translateY(-3px)`; card.style.setProperty('--bag-x', `${x * 14}px`); card.style.setProperty('--bag-y', `${y * 10}px`); });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; card.style.setProperty('--bag-x', '0px'); card.style.setProperty('--bag-y', '0px'); });
    const button = $('.card-image', card); button.addEventListener('click', () => { button.classList.remove('poke'); void button.offsetWidth; button.classList.add('poke'); tickSound(); });
    button.addEventListener('animationend', () => button.classList.remove('poke'));
  });
  const rail = $('.range-viewport'); let drag = null, railDragged = false, lastRailX = 0;
  let railCycle = 0, railGoal = null, railHovered = false, railFocused = false, railTouching = false;
  let railVisible = false, railAuto = !motion.matches, railFrameTime = 0, railCarry = 0, railResumeAt = 0;
  const loopToggle = document.createElement('button');
  loopToggle.id = 'rail-autoplay'; loopToggle.className = 'rail-loop-toggle';
  $('.rail-controls>span').replaceWith(loopToggle);
  function renderLoopToggle() { loopToggle.textContent = railAuto && !motion.matches ? 'Ⅱ PAUSE LOOP' : '▷ PLAY LOOP'; loopToggle.setAttribute('aria-pressed', String(railAuto && !motion.matches)); loopToggle.disabled = motion.matches; }
  function normalizeRail() {
    if (!railCycle || railFocused) return;
    const current = rail.scrollLeft, start = railCycle * 2;
    const wrapped = start + ((current - start) % railCycle + railCycle) % railCycle;
    const delta = wrapped - current;
    if (Math.abs(delta) > 1) {
      rail.scrollTo({ left: wrapped, behavior: 'instant' });
      if (drag) drag.scroll += delta;
      if (railGoal !== null) railGoal += delta;
    }
  }
  function measureRail() {
    const items = $$('.rail-item'), phase = railCycle ? ((rail.scrollLeft % railCycle) + railCycle) % railCycle / railCycle : 0;
    railCycle = items[flavors.length].offsetLeft - items[0].offsetLeft;
    railGoal = null;
    rail.scrollTo({ left: railCycle * (2 + phase), behavior: 'instant' });
    $('.range-line').style.width = `${rail.scrollWidth}px`;
  }
  rail.addEventListener('scroll', normalizeRail, { passive: true });
  rail.addEventListener('pointerenter', () => { if (finePointer.matches) railHovered = true; });
  rail.addEventListener('pointerleave', () => { railHovered = false; });
  rail.addEventListener('focusin', () => { railFocused = true; });
  rail.addEventListener('focusout', event => { railFocused = rail.contains(event.relatedTarget); if (!railFocused) normalizeRail(); });
  rail.addEventListener('touchstart', () => { railTouching = true; railGoal = null; }, { passive: true });
  rail.addEventListener('touchend', () => { railTouching = false; railResumeAt = performance.now() + 1400; }, { passive: true });
  rail.addEventListener('touchcancel', () => { railTouching = false; }, { passive: true });
  rail.addEventListener('wheel', () => { railGoal = null; railResumeAt = performance.now() + 1400; }, { passive: true });
  rail.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') return; railGoal = null; drag = { x: event.clientX, scroll: rail.scrollLeft }; railDragged = false; lastRailX = event.clientX; });
  window.addEventListener('pointermove', event => { if (!drag) return; const distance = event.clientX - drag.x; if (Math.abs(distance) > 6) railDragged = true; rail.scrollLeft = drag.scroll - distance; const speed = event.clientX - lastRailX; lastRailX = event.clientX; if (!motion.matches) $$('.rail-bag').forEach((bag, index) => bag.style.setProperty('--swing', `${clamp(-speed * .65 + Math.sin(index) * 4, -22, 22)}deg`)); });
  window.addEventListener('pointerup', () => { drag = null; setTimeout(() => { railDragged = false; }, 0); if (!motion.matches) $$('.rail-bag').forEach((bag, index) => bag.style.setProperty('--swing', `${index % flavors.length % 2 ? 3 : -3}deg`)); });
  window.addEventListener('pointercancel', () => { drag = null; railDragged = false; });
  $$('.rail-bag').forEach(bag => {
    bag.addEventListener('click', event => {
      if (railDragged) { event.preventDefault(); return; }
      const id = bag.dataset.railFlavor, flipped = !bag.classList.contains('is-flipped');
      // Keep loop copies in sync so the back stays visible when the rail wraps.
      $$('[data-rail-flavor="' + id + '"]').forEach(copy => {
        copy.classList.toggle('is-flipped', flipped);
        copy.setAttribute('aria-pressed', String(flipped));
        copy.setAttribute('aria-label', 'Show ' + (flipped ? 'front' : 'back') + ' of ' + byId[id].name + ' packet');
        $('.rail-front', copy).setAttribute('aria-hidden', String(flipped));
        $('.rail-back', copy).setAttribute('aria-hidden', String(!flipped));
      });
      railResumeAt = performance.now() + 5000;
      tickSound();
    });
    bag.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      if (!event.repeat) bag.click();
    });
    bag.addEventListener('pointermove', event => { if (!drag && finePointer.matches && !motion.matches) { const rect = bag.getBoundingClientRect(); bag.style.setProperty('--swing', `${(event.clientX - rect.left - rect.width / 2) * .18}deg`); } });
    bag.addEventListener('pointerleave', () => { if (!drag) bag.style.setProperty('--swing', '0deg'); });
  });
  function moveRail(direction) { normalizeRail(); railResumeAt = performance.now() + 1400; if (motion.matches) { rail.scrollLeft += direction * 440; normalizeRail(); } else railGoal = (railGoal === null ? rail.scrollLeft : railGoal) + direction * 440; }
  $('#rail-left').addEventListener('click', () => moveRail(-1)); $('#rail-right').addEventListener('click', () => moveRail(1));
  rail.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); moveRail(event.key === 'ArrowRight' ? 1 : -1); } });
  loopToggle.addEventListener('click', () => { railAuto = !railAuto; renderLoopToggle(); });
  const railObserver = new IntersectionObserver(entries => { railVisible = entries[0].isIntersecting; }); railObserver.observe(rail);
  function animateRail(time) {
    requestAnimationFrame(animateRail);
    const dt = Math.min((time - railFrameTime) / 1000, .05); railFrameTime = time;
    if (document.hidden || !railVisible || !railCycle) return;
    if (railGoal !== null && !drag && !railTouching) {
      const remaining = railGoal - rail.scrollLeft;
      rail.scrollTo({ left: rail.scrollLeft + remaining * Math.min(1, dt * 12), behavior: 'instant' });
      if (Math.abs(remaining) < 2) { rail.scrollTo({ left: railGoal, behavior: 'instant' }); railGoal = null; }
      normalizeRail();
    } else if (railAuto && !motion.matches && !drag && !railHovered && !railFocused && !railTouching && time > railResumeAt) {
      railCarry += dt * 38;
      const step = Math.floor(railCarry);
      if (step) { rail.scrollTo({ left: rail.scrollLeft + step, behavior: 'instant' }); railCarry -= step; normalizeRail(); }
    }
  }
  addEventListener('resize', measureRail, { passive: true });
  motion.addEventListener('change', () => { railAuto = !motion.matches; railGoal = null; renderLoopToggle(); });
  measureRail(); renderLoopToggle(); requestAnimationFrame(animateRail);

  const menu = $('.menu-toggle'), mobileNav = $('#mobile-nav');
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); mobileNav.hidden = true; }
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); mobileNav.hidden = !open; });
  $$('#mobile-nav a').forEach(link => link.addEventListener('click', closeMenu));
  addEventListener('keydown', event => { if (event.key === 'Escape') { closeMenu(); finishIntro(); } });
  matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  motion.addEventListener('change', () => { auto = !motion.matches; restartAuto(); if (motion.matches) finishIntro(); measure(); });
  $$('.questions details').forEach(details => details.addEventListener('toggle', () => { if (details.open) $$('.questions details').forEach(other => { if (other !== details) other.open = false; }); }));
  measure(); setFlavor(0, true); restartAuto();
})();
