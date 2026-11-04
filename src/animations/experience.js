import { flavors, byId } from "../data/flavors.js";
import { CrunchPouch } from "./pouch.js";

export function setupExperience(scope, introAnimation, notify) {
  const {
    requestAnimationFrame,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    IntersectionObserver,
  } = scope;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];
  const clamp = (value, low = 0, high = 1) =>
    Math.max(low, Math.min(high, value));
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const carousel = $(".carousel");
  const hero = $("#flavors");
  const inside = $("#inside");
  const header = $(".header");
  let selected = 0,
    auto = !motion.matches,
    autoTimer,
    userInteracting = false,
    titleTimer;
  let sceneProgress = 0,
    targetProgress = 0,
    currentChapter = -1,
    lastScroll = scrollY,
    scrollVelocity = 0;
  let heroStart = 0,
    heroTravel = 1,
    insideStart = 0,
    insideTravel = 1;
  let soundOn = false,
    audio;

  function setFlavor(index, immediate = false) {
    selected = (index + flavors.length) % flavors.length;
    const flavor = flavors[selected];
    document.documentElement.style.setProperty("--scene", flavor.color);
    document.documentElement.style.setProperty("--scene-ink", flavor.ink);
    $('meta[name="theme-color"]').content = flavor.color;
    $$(".carousel-pack").forEach((pack, i) => {
      let offset = (i - selected + flavors.length) % flavors.length;
      if (offset > flavors.length / 2) offset -= flavors.length;
      const distance = Math.abs(offset),
        mobile = innerWidth <= 760;
      const spacing = innerWidth * (mobile ? 0.39 : 0.145);
      pack.style.transform = `translate(-50%,-50%) translate3d(${offset * spacing}px,${distance * (mobile ? 20 : 27)}px,${-distance * 170}px) rotateY(${-offset * 19}deg) rotateZ(${offset * 9}deg) scale(${1 - distance * 0.07})`;
      pack.style.zIndex = String(10 - distance);
      pack.style.opacity = distance > 1 && mobile ? ".45" : "1";
      pack.classList.toggle("is-active", i === selected);
      pack.setAttribute("aria-pressed", String(i === selected));
    });
    $$("[data-dot]").forEach((dot, i) => {
      dot.classList.toggle("active", i === selected);
      dot.setAttribute("aria-pressed", String(i === selected));
    });
    $(".flavor-counter").textContent = `0${selected + 1}`;
    $(".hero-flavor-copy>.micro").textContent = flavor.tag;
    clearTimeout(titleTimer);
    const title = $("#flavor-title");
    if (!immediate && !motion.matches) title.classList.add("changing");
    titleTimer = setTimeout(
      () => {
        title.textContent = flavor.name.toUpperCase();
        title.classList.remove("changing");
      },
      immediate || motion.matches ? 0 : 130,
    );
  }
  function tickSound() {
    if (!soundOn || !audio) return;
    if (audio.state === "suspended") audio.resume();
    const oscillator = audio.createOscillator(),
      gain = audio.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(180 + selected * 35, audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      60,
      audio.currentTime + 0.09,
    );
    gain.gain.setValueAtTime(0.045, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.1);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.11);
  }
  function restartAuto() {
    clearInterval(autoTimer);
    if (auto && !motion.matches)
      autoTimer = setInterval(() => {
        if (
          !document.hidden &&
          scrollY < hero.offsetHeight - innerHeight * 0.8 &&
          !userInteracting
        ) {
          setFlavor(selected + 1);
        }
      }, 3700);
    $("#autoplay-toggle").setAttribute(
      "aria-pressed",
      String(auto && !motion.matches),
    );
    $("#autoplay-toggle").innerHTML =
      `<span>${auto && !motion.matches ? "Ⅱ" : "▷"}</span> AUTOPLAY`;
  }
  function chooseFlavor(index) {
    setFlavor(index);
    tickSound();
    restartAuto();
  }
  scope.listen($("#previous-flavor"), "click", () =>
    chooseFlavor(selected - 1),
  );
  scope.listen($("#next-flavor"), "click", () => chooseFlavor(selected + 1));
  $$("[data-carousel]").forEach((button) =>
    scope.listen(button, "click", () => {
      if (!carouselDragged) chooseFlavor(Number(button.dataset.carousel));
    }),
  );
  $$("[data-dot]").forEach((button) =>
    scope.listen(button, "click", () =>
      chooseFlavor(Number(button.dataset.dot)),
    ),
  );
  scope.listen($("#autoplay-toggle"), "click", () => {
    auto = !auto;
    restartAuto();
  });
  scope.listen($("#hero-explore"), "click", () =>
    inside.scrollIntoView({ behavior: motion.matches ? "instant" : "smooth" }),
  );
  scope.listen(carousel, "keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      chooseFlavor(selected + (event.key === "ArrowRight" ? 1 : -1));
    }
  });
  let carouselX = null,
    carouselDragged = false;
  scope.listen(carousel, "pointerdown", (event) => {
    carouselX = event.clientX;
    carouselDragged = false;
    userInteracting = true;
  });
  scope.listen(carousel, "pointermove", (event) => {
    if (carouselX !== null && Math.abs(event.clientX - carouselX) > 15)
      carouselDragged = true;
  });
  scope.listen(window, "pointerup", (event) => {
    if (carouselX !== null && Math.abs(event.clientX - carouselX) > 40)
      chooseFlavor(selected + (event.clientX < carouselX ? 1 : -1));
    carouselX = null;
    userInteracting = false;
    setTimeout(() => {
      carouselDragged = false;
    }, 0);
  });
  scope.listen(carousel, "pointercancel", () => {
    carouselX = null;
    userInteracting = false;
    carouselDragged = false;
  });
  scope.listen(carousel, "pointerenter", () => {
    if (finePointer.matches) userInteracting = true;
  });
  scope.listen(carousel, "pointerleave", () => {
    if (carouselX === null) userInteracting = false;
  });
  scope.listen(carousel, "focusin", () => {
    userInteracting = true;
  });
  scope.listen(carousel, "focusout", () => {
    userInteracting = false;
  });
  scope.listen($("#sound-toggle"), "click", () => {
    const AudioClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioClass) {
      notify("Sound is unavailable in this browser.");
      return;
    }
    if (!audio) audio = new AudioClass();
    soundOn = !soundOn;
    $("#sound-toggle").setAttribute("aria-pressed", String(soundOn));
    $("#sound-toggle b").textContent = soundOn ? "ON" : "OFF";
    tickSound();
  });

  // The short opening sequence can always be skipped or replayed.
  const intro = $(".intro");
  let introTimer;
  function finishIntro() {
    introAnimation.stop();
    const focused = intro.contains(document.activeElement);
    intro.classList.add("done");
    intro.inert = true;
    $(".header").inert = false;
    $("main").inert = false;
    $(".skip-link").inert = false;
    clearTimeout(introTimer);
    if (focused) $("#next-flavor").focus({ preventScroll: true });
  }
  function playIntro() {
    if (motion.matches) {
      finishIntro();
      return;
    }
    intro.inert = false;
    $(".header").inert = true;
    $("main").inert = true;
    $(".skip-link").inert = true;
    intro.classList.remove("done");
    introAnimation.play();
    clearTimeout(introTimer);
    introTimer = setTimeout(finishIntro, 3200);
  }
  scope.listen($(".skip-intro"), "click", finishIntro);
  scope.listen($("#replay-intro"), "click", () => {
    scrollTo({ top: 0, behavior: "instant" });
    playIntro();
  });
  playIntro();

  // Native scrolling drives the sticky stage. No wheel interception or scroll lock.
  const pouch = new CrunchPouch(
    $("#pouch-canvas"),
    "assets/flamin.png",
    "assets/flamin-back.png",
  );
  scope.add(() => pouch.dispose());
  scope.add(() => {
    if (audio) audio.close();
  });
  scope.add(() => {
    intro.inert = false;
    header.inert = false;
    $("main").inert = false;
    $(".skip-link").inert = false;
  });
  const chips = $$(".flying-chip").map((element, i) => {
    const seed = (Math.sin((i + 1) * 127.1) * 43758.5453) % 1;
    const size = 16 + Math.abs(seed) * 86;
    element.style.setProperty("--size", `${size}px`);
    return {
      element,
      angle: i * 2.39996,
      radius: 0.14 + Math.abs(seed) * 0.76,
      depth: Math.sin(i * 3.1),
      phase: i * 0.9,
    };
  });
  const chapters = [
    {
      title: "BUILT TO<br>PROTECT.",
      label: "THE GOOD STUFF",
      number: "01 / THE BAG",
      callout: "Big flavor.<br>A fiery crunch.<br>Ready to go.",
    },
    {
      title: "GOOD THINGS<br>START IN<br>THE GROUND.",
      label: "KEEP IT REAL",
      number: "02 / THE POTATO",
      callout: "Whole potatoes.<br>A golden beginning.",
    },
    {
      title: "CUT<br>PAPER-THIN.",
      label: "A DIFFERENT PERSPECTIVE",
      number: "03 / THE CRUNCH",
      callout: "Thin slices.<br>A big crunch.",
    },
    {
      title: "FLAMIN’<br>HOT.",
      label: "TURN UP THE HEAT",
      number: "04 / THE HEAT",
      callout: "A fiery kick.<br>A whole lot<br>of flavor.",
    },
  ];
  function measure() {
    heroStart = hero.offsetTop;
    heroTravel = Math.max(1, hero.offsetHeight - innerHeight);
    insideStart = inside.offsetTop;
    insideTravel = Math.max(1, inside.offsetHeight - innerHeight);
    setFlavor(selected, true);
    updateScroll();
  }
  function updateScroll() {
    const y = scrollY;
    targetProgress = clamp((y - insideStart) / insideTravel);
    scrollVelocity = Math.max(scrollVelocity, Math.abs(y - lastScroll));
    lastScroll = y;
    const heroProgress = clamp((y - heroStart) / heroTravel);
    if (heroProgress > 0.03 && heroProgress < 1 && !motion.matches) {
      const index = Math.min(
        flavors.length - 1,
        Math.floor(heroProgress * flavors.length),
      );
      if (index !== selected) setFlavor(index);
    }
    const insideActive =
      y + 110 >= insideStart && y < insideStart + inside.offsetHeight - 110;
    const paperActive =
      y >= insideStart + inside.offsetHeight - 110 &&
      y < $("#join").offsetTop - 110;
    header.classList.toggle("on-dark", insideActive);
    header.classList.toggle("on-paper", paperActive);
    let active = "flavors";
    for (const id of ["flavors", "inside", "shop", "range", "qa", "join"])
      if (y + innerHeight * 0.3 >= $(`#${id}`).offsetTop) active = id;
    $$(".nav a").forEach((link) =>
      link.classList.toggle("active", link.hash === `#${active}`),
    );
  }
  scope.listen(window, "scroll", updateScroll, { passive: true });
  scope.listen(window, "resize", measure, { passive: true });
  $$("[data-chapter]").forEach((button) =>
    scope.listen(button, "click", () => {
      const chapter = Number(button.dataset.chapter);
      scrollTo({
        top:
          insideStart +
          (chapter === 3 ? 0.95 : (chapter + 0.12) / 3.35) * insideTravel,
        behavior: motion.matches ? "instant" : "smooth",
      });
    }),
  );
  let pointerX = 0,
    pointerY = 0;
  scope.listen($(".inside-stage"), "pointermove", (event) => {
    if (finePointer.matches) {
      pointerX = (event.clientX / innerWidth - 0.5) * 0.16;
      pointerY = (event.clientY / innerHeight - 0.5) * 0.12;
    }
  });
  scope.listen($(".inside-stage"), "pointerleave", () => {
    pointerX = pointerY = 0;
  });
  let lastFrame = 0;
  function frame(time) {
    requestAnimationFrame(frame);
    if (document.hidden || time - lastFrame < 25) return;
    const dt = Math.min((time - lastFrame) / 1000, 0.1);
    lastFrame = time;
    const inView =
      scrollY + innerHeight >= insideStart &&
      scrollY <= insideStart + inside.offsetHeight;
    if (!inView) return;
    sceneProgress +=
      (targetProgress - sceneProgress) *
      (motion.matches ? 1 : Math.min(1, dt * 11));
    if (Math.abs(targetProgress - sceneProgress) < 0.0001)
      sceneProgress = targetProgress;
    const p = sceneProgress,
      t = motion.matches ? 0 : time / 1000;
    const chapter = Math.min(3, Math.floor(p * 3.35));
    if (chapter !== currentChapter) {
      currentChapter = chapter;
      const text = chapters[chapter];
      $("#inside-title").innerHTML = text.title;
      $("#inside-label").textContent = text.label;
      $("#callout-number").textContent = text.number;
      $("#callout-text").innerHTML = text.callout;
      $(".inside-number").textContent = `0${chapter + 1}`;
      $$("[data-chapter]").forEach((button, i) => {
        button.classList.toggle("active", i === chapter);
        button.setAttribute("aria-pressed", String(i === chapter));
      });
    }
    const storm = clamp((p - 0.66) / 0.25),
      angle = motion.matches ? -0.18 : p * Math.PI * 6 - 0.18 + storm * 0.9;
    const stage = $(".inside-stage");
    stage.style.setProperty("--storm", String(storm));
    stage.classList.toggle("storm-active", storm > 0.8);
    const landingTurn = clamp((p - 0.95) / 0.05);
    const rotation = [
      motion.matches
        ? 0.04
        : (Math.sin(p * Math.PI * 3) * 0.18 + pointerY) * (1 - landingTurn),
      (angle + pointerX) * (1 - landingTurn) + Math.PI * 6 * landingTurn,
      (-0.13 + Math.sin(p * Math.PI * 4) * 0.16) * (1 - landingTurn) -
        0.12 * landingTurn,
    ];
    pouch.draw(rotation, (innerWidth <= 760 ? 0.94 : 1.03) - storm * 0.32);
    $(".fallback-bag").style.setProperty(
      "--bag-turn",
      `${(angle * 180) / Math.PI}deg`,
    );
    const pouchStage = $(".pouch-stage");
    pouchStage.style.left = innerWidth <= 760 ? "-12%" : `${26 - storm * 6}%`;
    pouchStage.style.right = innerWidth <= 760 ? "-12%" : `${12 + storm * 8}%`;
    pouchStage.style.top = innerWidth <= 760 ? `${35 - storm * 23}%` : "8%";
    pouchStage.style.transform = `translateY(${(innerWidth <= 760 ? -90 * clamp(p * 5) * (1 - storm) : 0) + (motion.matches ? 0 : Math.sin(t * 1.2) * 5)}px)`;
    $(".inside-copy").style.opacity = String(1 - storm);
    $(".inside-copy").style.transform = `translateY(${-storm * 40}px)`;
    $(".inside-callout").style.opacity = String(1 - storm);
    $(".scroll-progress>span").style.width = `${p * 100}%`;
    $("#spin-speed").textContent =
      storm > 0.2
        ? `SPIN SPEED ${(Math.min(scrollVelocity, 200) * 0.31 + 1.2).toFixed(1)} CHIPS / SEC`
        : "TAKE A CLOSER LOOK";
    scrollVelocity *= 0.86;
    chips.forEach((chip, index) => {
      const distance = chip.radius * (0.55 + storm * 0.25),
        spin = chip.angle + p * 5.8 + t * 0.08;
      const x = Math.cos(spin) * innerWidth * distance,
        y =
          Math.sin(spin) * innerHeight * distance * 1.3 +
          Math.sin(t * 0.6 + chip.phase) * 18;
      // A clear center keeps the product readable while foreground chips pass around it.
      const centerMask =
        storm > 0.5 &&
        Math.abs(x) < innerWidth * 0.115 &&
        Math.abs(y) < innerHeight * 0.27
          ? 0.12
          : 1;
      const opacity =
        clamp((p - 0.03) * 4) * (0.12 + storm * 0.88) * centerMask;
      chip.element.style.opacity = motion.matches ? "0" : String(opacity);
      chip.element.style.transform = `translate3d(${x}px,${y}px,${chip.depth * 280}px) rotateX(${p * 360 + index * 29}deg) rotateY(${p * 240 + index * 37}deg) rotateZ(${t * 8 + index * 41}deg) scale(${0.5 + storm * (0.7 + Math.max(0, chip.depth) * 0.5)})`;
      chip.element.style.filter =
        chip.depth > 0.6 && storm > 0.5 ? "blur(2.5px)" : "none";
    });
  }
  requestAnimationFrame(frame);

  function flyBag(source, target, flavor) {
    if (!source || !target || motion.matches) return;
    const from = source.getBoundingClientRect(),
      to = target.getBoundingClientRect();
    if (!from.width || !to.width) return;
    const ghost = document.createElement("img");
    ghost.src = `assets/${flavor}.png`;
    ghost.alt = "";
    ghost.className = "bag-to-box";
    ghost.setAttribute("aria-hidden", "true");
    const size = Math.min(from.width, 125);
    ghost.style.cssText = `width:${size}px;height:${size * 1.4}px;left:${from.left + from.width / 2 - size / 2}px;top:${from.top + from.height / 2 - size * 0.7}px`;
    document.body.append(ghost);
    const dx = to.left + to.width / 2 - from.left - from.width / 2,
      dy = to.top + to.height / 2 - from.top - from.height / 2;
    const animation = ghost.animate(
      [
        { transform: "translate(0,0) rotate(-8deg) scale(1)", opacity: 1 },
        {
          transform: `translate(${dx * 0.45}px,${dy * 0.25 - 70}px) rotate(12deg) scale(.8)`,
          opacity: 1,
          offset: 0.45,
        },
        {
          transform: `translate(${dx}px,${dy}px) rotate(-10deg) scale(.15)`,
          opacity: 0.2,
        },
      ],
      { duration: 650, easing: "cubic-bezier(.35,0,.35,1)" },
    );
    const release = scope.add(() => {
      animation.cancel();
      ghost.remove();
    });
    animation.finished.then(
      () => {
        release();
        ghost.remove();
        target.animate([{ scale: 1 }, { scale: 1.08 }, { scale: 1 }], {
          duration: 250,
        });
      },
      () => {
        release();
        ghost.remove();
      },
    );
  }
  // Physical card tilts and elastic presses, with touch and keyboard equivalents.
  $$(".shop-card").forEach((card) => {
    scope.listen(card, "pointermove", (event) => {
      if (!finePointer.matches || motion.matches) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5,
        y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translateY(-3px)`;
      card.style.setProperty("--bag-x", `${x * 14}px`);
      card.style.setProperty("--bag-y", `${y * 10}px`);
    });
    scope.listen(card, "pointerleave", () => {
      card.style.transform = "";
      card.style.setProperty("--bag-x", "0px");
      card.style.setProperty("--bag-y", "0px");
    });
    const button = $(".card-image", card);
    scope.listen(button, "click", () => {
      button.classList.remove("poke");
      void button.offsetWidth;
      button.classList.add("poke");
      tickSound();
    });
    scope.listen(button, "animationend", () => button.classList.remove("poke"));
  });
  const rail = $(".range-viewport");
  let drag = null,
    railDragged = false,
    lastRailX = 0;
  let railCycle = 0,
    railGoal = null,
    railHovered = false,
    railFocused = false,
    railTouching = false;
  let railVisible = false,
    railAuto = !motion.matches,
    railFrameTime = 0,
    railCarry = 0,
    railResumeAt = 0;
  const loopToggle = $("#rail-autoplay");
  function renderLoopToggle() {
    loopToggle.textContent =
      railAuto && !motion.matches ? "Ⅱ PAUSE LOOP" : "▷ PLAY LOOP";
    loopToggle.setAttribute(
      "aria-pressed",
      String(railAuto && !motion.matches),
    );
    loopToggle.disabled = motion.matches;
  }
  function normalizeRail() {
    if (!railCycle || railFocused) return;
    const current = rail.scrollLeft,
      start = railCycle * 2;
    const wrapped =
      start + ((((current - start) % railCycle) + railCycle) % railCycle);
    const delta = wrapped - current;
    if (Math.abs(delta) > 1) {
      rail.scrollTo({ left: wrapped, behavior: "instant" });
      if (drag) drag.scroll += delta;
      if (railGoal !== null) railGoal += delta;
    }
  }
  function measureRail() {
    const items = $$(".rail-item"),
      phase = railCycle
        ? (((rail.scrollLeft % railCycle) + railCycle) % railCycle) / railCycle
        : 0;
    railCycle = items[flavors.length].offsetLeft - items[0].offsetLeft;
    railGoal = null;
    rail.scrollTo({ left: railCycle * (2 + phase), behavior: "instant" });
    $(".range-line").style.width = `${rail.scrollWidth}px`;
  }
  scope.listen(rail, "scroll", normalizeRail, { passive: true });
  scope.listen(rail, "pointerenter", () => {
    if (finePointer.matches) railHovered = true;
  });
  scope.listen(rail, "pointerleave", () => {
    railHovered = false;
  });
  scope.listen(rail, "focusin", () => {
    railFocused = true;
  });
  scope.listen(rail, "focusout", (event) => {
    railFocused = rail.contains(event.relatedTarget);
    if (!railFocused) normalizeRail();
  });
  scope.listen(
    rail,
    "touchstart",
    () => {
      railTouching = true;
      railGoal = null;
    },
    { passive: true },
  );
  scope.listen(
    rail,
    "touchend",
    () => {
      railTouching = false;
      railResumeAt = performance.now() + 1400;
    },
    { passive: true },
  );
  scope.listen(
    rail,
    "touchcancel",
    () => {
      railTouching = false;
    },
    { passive: true },
  );
  scope.listen(
    rail,
    "wheel",
    () => {
      railGoal = null;
      railResumeAt = performance.now() + 1400;
    },
    { passive: true },
  );
  scope.listen(rail, "pointerdown", (event) => {
    if (event.pointerType === "touch") return;
    railGoal = null;
    drag = { x: event.clientX, scroll: rail.scrollLeft };
    railDragged = false;
    lastRailX = event.clientX;
  });
  scope.listen(window, "pointermove", (event) => {
    if (!drag) return;
    const distance = event.clientX - drag.x;
    if (Math.abs(distance) > 6) railDragged = true;
    rail.scrollLeft = drag.scroll - distance;
    const speed = event.clientX - lastRailX;
    lastRailX = event.clientX;
    if (!motion.matches)
      $$(".rail-bag").forEach((bag, index) =>
        bag.style.setProperty(
          "--swing",
          `${clamp(-speed * 0.65 + Math.sin(index) * 4, -22, 22)}deg`,
        ),
      );
  });
  scope.listen(window, "pointerup", () => {
    drag = null;
    setTimeout(() => {
      railDragged = false;
    }, 0);
    if (!motion.matches)
      $$(".rail-bag").forEach((bag, index) =>
        bag.style.setProperty(
          "--swing",
          `${(index % flavors.length) % 2 ? 3 : -3}deg`,
        ),
      );
  });
  scope.listen(window, "pointercancel", () => {
    drag = null;
    railDragged = false;
  });
  $$(".rail-bag").forEach((bag) => {
    scope.listen(bag, "click", (event) => {
      if (railDragged) {
        event.preventDefault();
        return;
      }
      const id = bag.dataset.railFlavor,
        flipped = !bag.classList.contains("is-flipped");
      // Keep loop copies in sync so the back stays visible when the rail wraps.
      $$('[data-rail-flavor="' + id + '"]').forEach((copy) => {
        copy.classList.toggle("is-flipped", flipped);
        copy.setAttribute("aria-pressed", String(flipped));
        copy.setAttribute(
          "aria-label",
          "Show " +
            (flipped ? "front" : "back") +
            " of " +
            byId[id].name +
            " packet",
        );
        $(".rail-front", copy).setAttribute("aria-hidden", String(flipped));
        $(".rail-back", copy).setAttribute("aria-hidden", String(!flipped));
      });
      railResumeAt = performance.now() + 5000;
      tickSound();
    });
    scope.listen(bag, "keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      if (!event.repeat) bag.click();
    });
    scope.listen(bag, "pointermove", (event) => {
      if (!drag && finePointer.matches && !motion.matches) {
        const rect = bag.getBoundingClientRect();
        bag.style.setProperty(
          "--swing",
          `${(event.clientX - rect.left - rect.width / 2) * 0.18}deg`,
        );
      }
    });
    scope.listen(bag, "pointerleave", () => {
      if (!drag) bag.style.setProperty("--swing", "0deg");
    });
  });
  function moveRail(direction) {
    normalizeRail();
    railResumeAt = performance.now() + 1400;
    if (motion.matches) {
      rail.scrollLeft += direction * 440;
      normalizeRail();
    } else
      railGoal =
        (railGoal === null ? rail.scrollLeft : railGoal) + direction * 440;
  }
  scope.listen($("#rail-left"), "click", () => moveRail(-1));
  scope.listen($("#rail-right"), "click", () => moveRail(1));
  scope.listen(rail, "keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      moveRail(event.key === "ArrowRight" ? 1 : -1);
    }
  });
  scope.listen(loopToggle, "click", () => {
    railAuto = !railAuto;
    renderLoopToggle();
  });
  const railObserver = new IntersectionObserver((entries) => {
    railVisible = entries[0].isIntersecting;
  });
  railObserver.observe(rail);
  function animateRail(time) {
    requestAnimationFrame(animateRail);
    const dt = Math.min((time - railFrameTime) / 1000, 0.05);
    railFrameTime = time;
    if (document.hidden || !railVisible || !railCycle) return;
    if (railGoal !== null && !drag && !railTouching) {
      const remaining = railGoal - rail.scrollLeft;
      rail.scrollTo({
        left: rail.scrollLeft + remaining * Math.min(1, dt * 12),
        behavior: "instant",
      });
      if (Math.abs(remaining) < 2) {
        rail.scrollTo({ left: railGoal, behavior: "instant" });
        railGoal = null;
      }
      normalizeRail();
    } else if (
      railAuto &&
      !motion.matches &&
      !drag &&
      !railHovered &&
      !railFocused &&
      !railTouching &&
      time > railResumeAt
    ) {
      railCarry += dt * 38;
      const step = Math.floor(railCarry);
      if (step) {
        rail.scrollTo({ left: rail.scrollLeft + step, behavior: "instant" });
        railCarry -= step;
        normalizeRail();
      }
    }
  }
  scope.listen(window, "resize", measureRail, { passive: true });
  scope.listen(motion, "change", () => {
    railAuto = !motion.matches;
    railGoal = null;
    renderLoopToggle();
  });
  measureRail();
  renderLoopToggle();
  requestAnimationFrame(animateRail);

  const menu = $(".menu-toggle"),
    mobileNav = $("#mobile-nav");
  function closeMenu() {
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation");
    mobileNav.hidden = true;
  }
  scope.listen(menu, "click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    mobileNav.hidden = !open;
  });
  $$("#mobile-nav a").forEach((link) => scope.listen(link, "click", closeMenu));
  scope.listen(window, "keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      finishIntro();
    }
  });
  scope.listen(matchMedia("(min-width: 761px)"), "change", (event) => {
    if (event.matches) closeMenu();
  });
  scope.listen(motion, "change", () => {
    auto = !motion.matches;
    restartAuto();
    if (motion.matches) finishIntro();
    measure();
  });
  $$(".questions details").forEach((details) =>
    scope.listen(details, "toggle", () => {
      if (details.open)
        $$(".questions details").forEach((other) => {
          if (other !== details) other.open = false;
        });
    }),
  );
  measure();
  setFlavor(0, true);
  restartAuto();
  return {
    tickSound,
    flyToBox(source, id) {
      requestAnimationFrame(() => {
        const card = source.closest(".shop-card");
        card.classList.remove("just-added");
        void card.offsetWidth;
        card.classList.add("just-added");
        const bounds = $("#builder").getBoundingClientRect();
        const visible =
          bounds.bottom > innerHeight * 0.1 && bounds.top < innerHeight * 0.9;
        flyBag(source, visible ? $("#pack-slots") : $(".mix-tray"), id);
      });
    },
    flyToBasket(id) {
      flyBag($(".pack-slot img"), $("#basket-toggle"), id);
    },
  };
}
