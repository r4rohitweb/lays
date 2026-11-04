export function setupIntro(scope) {
  const { requestAnimationFrame, cancelAnimationFrame } = scope;
  const intro = document.querySelector(".intro");
  const canvas = intro.querySelector(".intro-chips");
  const ctx = canvas.getContext("2d");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let raf = 0,
    started = 0,
    width = 1,
    height = 1;
  const duration = 3200;
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);

  // Cache curved, shaded chips so each frame only transforms textured sprites.
  const textures = Array.from({ length: 5 }, (_, index) => {
    const tile = document.createElement("canvas");
    tile.width = 180;
    tile.height = 240;
    const c = tile.getContext("2d");
    c.translate(90, 120);
    c.beginPath();
    c.moveTo(-8, -108);
    c.bezierCurveTo(74, -118, 93, -34, 67, 35);
    c.bezierCurveTo(52, 88, 8, 113, -17, 107);
    c.bezierCurveTo(-88, 73, -91, -69, -8, -108);
    c.save();
    c.clip();
    const base = c.createLinearGradient(-80, -30, 85, 20);
    base.addColorStop(0, "#a87125");
    base.addColorStop(0.12, "#e8b94f");
    base.addColorStop(0.4, "#fff0ad");
    base.addColorStop(0.7, "#f4d77c");
    base.addColorStop(1, "#bb812d");
    c.fillStyle = base;
    c.fillRect(-90, -120, 180, 240);
    for (let x = -90; x < 95; x += 6) {
      c.beginPath();
      c.moveTo(x, -120);
      c.bezierCurveTo(x - 24, -35, x + 24, 45, x - 8, 120);
      c.strokeStyle = "#91602140";
      c.lineWidth = 1.4;
      c.stroke();
      c.translate(1.5, 0);
      c.strokeStyle = "#fff6c580";
      c.lineWidth = 1;
      c.stroke();
      c.translate(-1.5, 0);
    }
    for (let i = 0; i < 90; i++) {
      c.fillStyle = i % 3 ? "#aa6b142d" : "#fff8cc80";
      c.beginPath();
      c.arc(
        Math.sin(i * 17.3 + index) * 78,
        Math.cos(i * 9.7) * 110,
        0.6 + (i % 3) * 0.35,
        0,
        Math.PI * 2,
      );
      c.fill();
    }
    c.restore();
    c.strokeStyle = "#fce7a58c";
    c.lineWidth = 1.5;
    c.stroke();
    return tile;
  });
  const chips = Array.from({ length: 58 }, (_, i) => ({
    angle: i * 2.399963,
    radius: 0.1 + ((i * 37) % 97) / 105,
    depth: ((i * 29) % 59) / 59,
    phase: i * 1.71,
    texture: textures[i % textures.length],
  }));

  function resize() {
    width = innerWidth;
    height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function drawChip(texture, x, y, size, angle, flip, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(Math.max(0.06, Math.abs(flip)), 1);
    ctx.drawImage(texture, -size * 0.375, -size * 0.5, size * 0.75, size);
    ctx.restore();
  }
  function frame(now) {
    const elapsed = now - started,
      t = elapsed / 1000;
    ctx.clearRect(0, 0, width, height);
    const collapse = ease((t - 1.05) / 0.65);
    const exit = ease((t - 1.65) / 0.4);
    const spread = Math.max(width, height) * 0.63;
    chips
      .slice()
      .sort((a, b) => a.depth - b.depth)
      .forEach((chip, i) => {
        const angle = chip.angle + t * (0.48 + chip.depth * 0.4);
        const rush = 1 + Math.sin(t * 2 + chip.phase) * 0.18;
        const radius = chip.radius * spread * rush * (1 - collapse);
        const x = width * 0.5 + Math.cos(angle) * radius;
        const y = height * 0.5 + Math.sin(angle) * radius * 0.75;
        const size =
          (22 + Math.pow(chip.depth, 3) * Math.min(width * 0.32, 460)) *
          (1 - collapse * 0.75);
        drawChip(
          chip.texture,
          x,
          y,
          size,
          chip.phase + t * (i % 2 ? 1 : -1),
          Math.cos(chip.phase + t * 2.6),
          (1 - collapse) * 0.97,
        );
      });
    const heroIn = ease((t - 1.05) / 0.5);
    drawChip(
      textures[0],
      width * 0.5,
      height * 0.5,
      Math.min(width * 0.29, height * 0.35, 260) * (0.75 + heroIn * 0.25),
      -0.25 + t * 0.2,
      Math.cos((t - 1.55) * 7),
      heroIn * (1 - exit),
    );
    intro.style.setProperty("--intro-reveal", ease((t - 1.9) / 0.3));
    intro.classList.toggle("logo-reveal", t >= 1.9);
    if (elapsed < duration && !intro.classList.contains("done"))
      raf = requestAnimationFrame(frame);
  }
  const introAnimation = {
    play() {
      cancelAnimationFrame(raf);
      if (motion.matches) return;
      resize();
      intro.classList.remove("logo-reveal");
      intro.style.setProperty("--intro-reveal", 0);
      started = performance.now();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
    },
  };
  scope.listen(window, "resize", resize, { passive: true });
  return introAnimation;
}
