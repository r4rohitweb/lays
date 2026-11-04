const particleCount = window.innerWidth <= 760 ? 70 : 130;

export function InsideScene() {
  return (
    <section
      className="inside-scroll"
      id="inside"
      aria-labelledby="inside-title"
    >
      <div className="inside-stage">
        <span className="micro inside-kicker">02 — GO A LITTLE DEEPER</span>
        <span className="inside-number" aria-hidden="true">
          01
        </span>
        <div className="inside-copy">
          <span id="inside-label" className="micro">
            THE GOOD STUFF
          </span>
          <h2 id="inside-title">
            BIG FLAVOR.
            <br />
            NO SMALL
            <br />
            FEELINGS.
          </h2>
          <p id="inside-description">
            A familiar crunch. A whole new perspective.
            <br />
            Keep scrolling. There’s more inside.
          </p>
        </div>
        <div className="chip-storm" aria-hidden="true">
          {Array.from({ length: particleCount }, (_, i) => (
            <span key={i} className="flying-chip" />
          ))}
        </div>
        <div className="pouch-stage">
          <canvas
            id="pouch-canvas"
            aria-label="Rotating three-dimensional Lay’s bag"
          ></canvas>
          <div className="pouch-fallback">
            <div className="fallback-bag">
              <img src="assets/flamin.png" alt="Lay’s Flamin’ Hot bag" />
              <div className="fallback-back">
                <img
                  src="assets/flamin-back.png"
                  alt="Original back of the Lay’s Flamin’ Hot 2.5 oz packet"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="inside-callout">
          <span className="micro" id="callout-number">
            01 / THE FLAVOR
          </span>
          <p id="callout-text">
            A little smoky.
            <br />A little sweet.
            <br />A lot to love.
          </p>
          <span className="callout-line"></span>
        </div>
        <div
          className="inside-chapters"
          role="group"
          aria-label="Explore the bag"
        >
          <button
            className="active"
            data-chapter="0"
            aria-label="Go to flavor chapter"
          >
            01
          </button>
          <button data-chapter="1" aria-label="Go to potatoes chapter">
            02
          </button>
          <button data-chapter="2" aria-label="Go to crunch chapter">
            03
          </button>
          <button data-chapter="3" aria-label="Go to chip storm chapter">
            ✳
          </button>
        </div>
        <div className="inside-bottom micro">
          <span>
            SCROLL TO SPIN <span>↻</span>
          </span>
          <span id="spin-speed">TAKE A CLOSER LOOK</span>
          <span>KEEP THE GOOD TIMES ROLLING ↓</span>
        </div>
        <div className="scroll-progress">
          <span></span>
        </div>
      </div>
    </section>
  );
}
