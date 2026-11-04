import { flavors } from "../data/flavors.js";
const railImage = (flavor, face) =>
  flavor.id === "flamin"
    ? `assets/flamin${face === "back" ? "-back" : ""}.png`
    : `assets/rail/${flavor.id}-${face}.png`;

export function FlavorRail() {
  return (
    <section id="range" className="range section-pad">
      <div className="section-top">
        <div>
          <span className="micro">04 — THE LINEUP</span>
          <h2>
            PICK YOUR
            <br />
            CRUNCH.
          </h2>
        </div>
        <p>
          Drag the rail to browse. Run your cursor
          <br />
          through the bags. Tap a packet to see the back.
        </p>
      </div>
      <div
        className="range-viewport"
        tabIndex="0"
        role="region"
        aria-label="Draggable flavor lineup, use left and right arrow keys"
      >
        <div className="range-line"></div>
        <div id="range-track" className="range-track">
          {Array.from({ length: 7 }, (_, copy) =>
            flavors.map((flavor, index) => (
              <div
                key={`${copy}-${flavor.id}`}
                className="rail-item"
                aria-hidden={copy === 2 ? undefined : true}
              >
                <button
                  className="rail-bag"
                  data-rail-flavor={flavor.id}
                  aria-label={`Show back of ${flavor.name} packet`}
                  aria-pressed="false"
                  tabIndex={copy === 2 ? undefined : -1}
                  style={{ "--swing": `${index % 2 ? 3 : -3}deg` }}
                >
                  <span className="rail-flip">
                    <img
                      className="rail-front"
                      src={railImage(flavor, "front")}
                      alt={`Lay’s ${flavor.name} packet front`}
                      loading="lazy"
                      draggable={false}
                    />
                    <img
                      className="rail-back"
                      src={railImage(flavor, "back")}
                      alt={`Lay’s ${flavor.name} original packet back`}
                      aria-hidden="true"
                      loading="lazy"
                      draggable={false}
                    />
                  </span>
                  <span className="rail-hook" aria-hidden="true" />
                </button>
                <h3>{flavor.name.toUpperCase()}</h3>
                <span className="micro">
                  0{index + 1} / {flavor.tag}
                </span>
              </div>
            )),
          )}
        </div>
      </div>
      <div className="range-bottom micro">
        <span>GOOD THINGS COME IN BAGS.</span>
        <div className="rail-controls">
          <button id="rail-left" aria-label="Scroll lineup left">
            ←
          </button>
          <button id="rail-autoplay" className="rail-loop-toggle" />
          <button id="rail-right" aria-label="Scroll lineup right">
            →
          </button>
        </div>
        <span>SHARE THE GOOD STUFF ↗</span>
      </div>
    </section>
  );
}
