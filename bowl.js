'use strict';

(() => {
  const section = document.querySelector('#crunch-table');
  if (!section) return;
  const stage = section.querySelector('.crunch-table-stage');
  const bowl = section.querySelector('.glass-bowl');
  const pack = section.querySelector('.pour-pack');
  const pile = section.querySelector('.bowl-chips');
  const replay = section.querySelector('.pour-replay');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const progressBar = section.querySelector('.pour-progress > span');
  const progressLabel = section.querySelector('.pour-scroll-label');
  const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mouth = document.createElement('span'); mouth.className = 'pour-mouth'; pack.append(mouth);
  const impact = document.createElement('span'); impact.className = 'bowl-impact'; bowl.append(impact);
  const tableShadow = document.createElement('span'); tableShadow.className = 'packet-table-shadow';
  tableShadow.setAttribute('aria-hidden', 'true'); section.querySelector('.pour-scene').append(tableShadow);
  section.classList.add('physical-pour');
  let progress = 0, target = 0, visible = false, raf = 0, lastTime = 0, pointer = 0;
  const chips = Array.from({ length: 42 }, (_, i) => {
    const element = document.createElement('span'); element.className = 'bowl-chip';
    const row = Math.floor(i / 10), column = i % 10;
    const x = (row === 4 ? .45 + column * .1 : .30 - row * .025 + column * ((.40 + row * .05) / 9)) + Math.sin(i * 3.7) * .012;
    const y = .71 - row * .075 + Math.cos(i * 2.1) * .018;
    const size = 30 + i % 6 * 3;
    element.style.setProperty('--chip-size', size + 'px');
    element.style.setProperty('--chip-hue', (i % 4 * 3 - 3) + 'deg');
    element.style.zIndex = String(5 + row * 10 + i % 10);
    pile.append(element);
    return { element, x, y, size, turn: i * 47 % 150 - 75, seed: i * 1.71, start: .1 + i * .0175, duration: .15 + i % 4 * .006 };
  });

  function measureProgress() {
    const rect = section.getBoundingClientRect();
    target = motion.matches ? 1 : clamp(-rect.top / Math.max(1, section.offsetHeight - stage.offsetHeight));
    wake();
  }
  function draw(time) {
    raf = 0;
    const dt = Math.min((time - lastTime) / 1000 || .016, .05); lastTime = time;
    progress += (target - progress) * (motion.matches ? 1 : 1 - Math.exp(-dt * 14));
    if (Math.abs(target - progress) < .0001) progress = target;
    const p = progress, mobile = innerWidth <= 760;
    const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
    const lift = smooth(p / .28), tip = smooth((p - .25) / .17);
    const pour = clamp((p - .42) / .58);
    const stageWidth = stage.clientWidth, stageHeight = stage.offsetHeight;
    const restingLeft = mobile ? stageWidth * .07 : stageWidth * .36 - pack.offsetWidth / 2;
    const restingTop = stageHeight - (mobile ? 130 : 100) - pack.offsetHeight;
    const pouringLeft = stageWidth * (mobile ? .54 : .65) - (mobile ? 160 : 270);
    const pouringTop = stageHeight - (mobile ? 560 : innerWidth >= 1600 ? 725 : 700);
    pack.style.left = lerp(restingLeft, pouringLeft, lift) + 'px';
    pack.style.top = (lerp(restingTop, pouringTop, lift) - Math.sin(lift * Math.PI) * 22) + 'px';
    const tilt = lerp(-9, -3, lift) + tip * 130;
    const shaking = Math.sin(pour * Math.PI) * Math.sin(pour * 110) * 2.7;
    pack.style.transform = 'translateY(' + (motion.matches ? 0 : -Math.sin(pour * Math.PI) * 11) + 'px) rotate(' + (motion.matches ? 125 : tilt + shaking) + 'deg) rotateY(' + (motion.matches ? 0 : pointer * lift * 4) + 'deg)';
    pack.querySelector('img').style.scale = motion.matches ? '1' : (1 + Math.sin(pour * 95) * .012) + ' ' + (1 - Math.sin(pour * 95) * .018);
    tableShadow.style.left = restingLeft + pack.offsetWidth * .05 + 'px';
    tableShadow.style.top = restingTop + pack.offsetHeight - 6 + 'px';
    tableShadow.style.width = pack.offsetWidth * .9 + 'px';
    tableShadow.style.opacity = String((1 - lift * .9) * .5);
    tableShadow.style.transform = 'scaleX(' + (1 + lift * .6) + ')';
    const bowlRect = bowl.getBoundingClientRect(), source = mouth.getBoundingClientRect();
    const w = bowl.clientWidth, h = bowl.clientHeight;
    const sourceX = source.left - bowlRect.left, sourceY = source.top - bowlRect.top;
    let hit = 0;
    chips.forEach(chip => {
      const age = motion.matches ? 1 : (pour - chip.start) / chip.duration;
      chip.element.style.opacity = age <= 0 ? '0' : String(clamp(age * 12));
      if (age <= 0) return;
      const size = chip.size * (mobile ? .75 : 1);
      const endX = chip.x * w - size * .5, endY = chip.y * h - size * .5;
      let x = endX, y = endY, turn = chip.turn, flip = 1, pitch = 18;
      if (age < .7) {
        const fall = clamp(age / .7);
        const flutter = Math.sin(fall * 11 + chip.seed) * Math.sin(fall * Math.PI);
        x = lerp(sourceX - size * .5, endX, fall) + flutter * 12;
        y = lerp(sourceY, endY, fall * fall);
        turn += (1 - fall) * (chip.seed % 2 ? 280 : -250);
        flip = .18 + Math.abs(Math.cos(fall * Math.PI * 3 + chip.seed)) * .82;
        pitch = Math.sin(fall * 12 + chip.seed) * 55;
      } else if (age < 1) {
        const settle = (age - .7) / .3;
        const bounce = Math.abs(Math.sin(settle * Math.PI * 2)) * (1 - settle);
        y -= bounce * (mobile ? 17 : 28);
        x += Math.sin(settle * Math.PI * 2) * (1 - settle) * 8;
        turn += Math.sin(settle * Math.PI * 3) * (1 - settle) * 22;
        hit += bounce * .15;
      }
      chip.element.style.left = x.toFixed(2) + 'px'; chip.element.style.top = y.toFixed(2) + 'px';
      chip.element.style.transform = 'perspective(500px) rotate(' + turn + 'deg) rotateX(' + pitch + 'deg) scaleX(' + flip + ')';
      chip.element.style.filter = 'hue-rotate(' + (chip.seed % 9 - 3) + 'deg) brightness(' + (age < .7 ? 1.04 : .98 + chip.y * .06) + ')';
    });
    impact.style.opacity = String(clamp(hit, 0, .45));
    impact.style.scale = String(1 + hit * .6);
    bowl.style.setProperty('--glass-shift', (motion.matches ? 50 : 50 + pointer * 15 + Math.sin(p * 8) * 12) + '%');
    progressBar.style.width = p * 100 + '%';
    progressLabel.textContent = motion.matches ? 'A BOWLFUL OF GOOD TIMES' : p >= .99 ? 'A BOWLFUL OF GOOD TIMES · SCROLL UP TO REWIND' : p < .25 ? 'SCROLL TO LIFT THE PACKET' : p < .45 ? 'KEEP SCROLLING TO TILT THE BAG' : 'SCROLL TO POUR · SCROLL UP TO REWIND';
    if (visible && !motion.matches && Math.abs(progress - target) > .0001) wake();
  }
  function wake() { if (!raf) raf = requestAnimationFrame(draw); }
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) measureProgress(); }, { rootMargin: '100px' }).observe(section);
  stage.addEventListener('pointermove', event => { if (motion.matches || event.pointerType === 'touch') return; pointer = (event.clientX / innerWidth - .5) * 2; wake(); });
  stage.addEventListener('pointerleave', () => { pointer = 0; wake(); });
  replay.addEventListener('click', () => scrollTo({ top: scrollY + section.getBoundingClientRect().top, behavior: motion.matches ? 'instant' : 'smooth' }));
  addEventListener('scroll', measureProgress, { passive: true });
  addEventListener('resize', measureProgress, { passive: true });
  motion.addEventListener('change', measureProgress);
  measureProgress();
})();
