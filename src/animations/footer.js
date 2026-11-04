export function setupFooter(scope) {
  const { IntersectionObserver } = scope;
  const packScene = document.querySelector(".newsletter-pack");
  const orbitVisibility = new IntersectionObserver(
    (entries) => {
      packScene.classList.toggle("orbits-visible", entries[0].isIntersecting);
    },
    { rootMargin: "80px" },
  );
  orbitVisibility.observe(packScene);
  const header = document.querySelector(".header");
  const ending = document.querySelector("#join");
  const update = () =>
    header.classList.toggle(
      "on-footer",
      ending.getBoundingClientRect().top <= 110,
    );
  scope.listen(window, "scroll", update, { passive: true });
  scope.listen(window, "resize", update, { passive: true });
  update();
}
