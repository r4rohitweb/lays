export function setupPacketFlight(scope) {
  const { requestAnimationFrame } = scope;
  const inside = document.querySelector("#inside");
  const stage = inside.querySelector(".inside-stage");
  const pouch = stage.querySelector(".pouch-stage");
  const destination = document
    .querySelector('[data-add="flamin"]')
    .closest(".shop-card")
    .querySelector(".card-image img");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const packet = document.querySelector(".flight-packet");
  let pending = false;
  const clamp = (value, low = 0, high = 1) =>
    Math.max(low, Math.min(high, value));

  function render() {
    pending = false;
    const start =
      inside.offsetTop +
      inside.offsetHeight -
      innerHeight -
      innerHeight * 0.035;
    const rect = destination.getBoundingClientRect();
    const end = scrollY + rect.top + rect.height * 0.5 - innerHeight * 0.58;
    const progress = clamp(
      (scrollY - start) / Math.max(innerHeight * 0.4, end - start),
    );
    const active = !motion.matches && scrollY >= start && progress < 1;
    packet.hidden = !active;
    destination.classList.toggle("receiving-packet", active);
    pouch.style.opacity = active
      ? String(1 - clamp((scrollY - start) / (innerHeight * 0.035)))
      : "1";
    if (!active) return;

    const ease = progress * progress * (3 - 2 * progress);
    const aspect =
      destination.naturalWidth / destination.naturalHeight || 0.766;
    const targetHeight = Math.min(rect.height, rect.width / aspect);
    const sourceHeight =
      stage.offsetHeight *
      (innerWidth <= 760 ? 0.88 * 0.62 : 0.88 * 0.71) *
      0.765;
    const height = sourceHeight + (targetHeight - sourceHeight) * ease;
    const targetX = rect.left + rect.width * 0.5;
    // Keep the bag in view while the grid scrolls up beneath it.
    const targetY = clamp(
      rect.top + rect.height * 0.5,
      innerHeight * 0.3,
      innerHeight * 0.68,
    );
    const sourceY = stage.offsetHeight * (innerWidth <= 760 ? 0.56 : 0.52);
    const x = innerWidth * 0.5 + (targetX - innerWidth * 0.5) * ease;
    const y = sourceY + (targetY - sourceY) * ease;
    const angle = -7 + 2 * ease;
    packet.style.height = `${height}px`;
    packet.style.width = `${height * aspect}px`;
    packet.style.opacity = String(
      clamp((scrollY - start) / (innerHeight * 0.035)),
    );
    packet.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) rotate(${angle}deg)`;
  }
  function schedule() {
    if (!pending) {
      pending = true;
      requestAnimationFrame(render);
    }
  }
  scope.listen(window, "scroll", schedule, { passive: true });
  scope.listen(window, "resize", schedule, { passive: true });
  scope.listen(destination, "load", schedule);
  scope.listen(motion, "change", schedule);
  render();
}
