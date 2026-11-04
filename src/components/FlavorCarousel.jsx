import { flavors } from "../data/flavors.js";
import { ProductImage } from "./ProductImage.jsx";

export function FlavorCarousel() {
  return (
    <section
      id="flavors"
      className="flavor-story"
      aria-labelledby="flavor-title"
    >
      <div className="flavor-stage">
        <div className="rings" aria-hidden="true"></div>
        <div className="hero-grain" aria-hidden="true"></div>
        <div className="stage-top micro">
          <span>01 — FIND YOUR FLAVOR</span>
          <span>REAL POTATOES. UNREAL GOOD TIMES.</span>
        </div>
        <div
          className="carousel"
          role="group"
          aria-label="Flavor carousel"
          tabIndex="0"
        >
          <div id="carousel-packs">
            {flavors.map((flavor, index) => (
              <button
                key={flavor.id}
                className="carousel-pack"
                data-carousel={index}
                aria-label={`Select ${flavor.name}`}
                aria-pressed={index === 0}
                style={{ "--float-delay": `-${index}s` }}
              >
                <ProductImage flavor={flavor} eager />
              </button>
            ))}
          </div>
          <div className="carousel-shadow"></div>
        </div>
        <span className="hero-side-note micro">
          A BAG FULL OF
          <br />
          POSSIBILITIES.
        </span>
        <div className="hero-flavor-copy">
          <span className="micro">THE ORIGINAL GOOD MOOD</span>
          <h1 id="flavor-title">CLASSIC</h1>
          <div className="carousel-controls">
            <button id="previous-flavor" aria-label="Previous flavor">
              ←
            </button>
            <button id="hero-explore" aria-label="Explore selected flavor">
              ↗
            </button>
            <button id="next-flavor" aria-label="Next flavor">
              →
            </button>
          </div>
        </div>
        <div className="hero-bottom">
          <a href="#inside" className="micro">
            SCROLL TO EXPLORE <span>↓</span>
          </a>
          <div id="flavor-dots" role="group" aria-label="Choose a flavor">
            {flavors.map((flavor, index) => (
              <button
                key={flavor.id}
                data-dot={index}
                aria-label={`Show ${flavor.name}`}
                aria-pressed={index === 0}
              />
            ))}
          </div>
          <button id="autoplay-toggle" className="micro" aria-pressed="true">
            <span>Ⅱ</span> AUTOPLAY
          </button>
        </div>
        <span className="flavor-counter" aria-hidden="true">
          01
        </span>
      </div>
    </section>
  );
}
