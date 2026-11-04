export function PourScene() {
  return (
    <section
      id="crunch-table"
      className="crunch-table physical-pour"
      aria-labelledby="crunch-table-title"
    >
      <div className="crunch-table-stage">
        <div className="crunch-table-copy">
          <span className="micro">A LITTLE POUR. A LOT OF HAPPY.</span>
          <h2 id="crunch-table-title">
            GOOD TIMES.
            <br />
            <span>BY THE BOWLFUL.</span>
          </h2>
          <p>Golden chips. A glass bowl. An open invitation to share.</p>
        </div>
        <div
          className="pour-scene"
          role="img"
          aria-label="A Lay’s Classic bag pours golden potato chips into a transparent glass bowl on a wooden table."
        >
          <span className="packet-table-shadow" aria-hidden="true" />
          <div className="table-surface" aria-hidden="true"></div>
          <div className="table-edge" aria-hidden="true"></div>
          <div className="pour-pack" aria-hidden="true">
            <img
              src="assets/classic.png"
              alt=""
              loading="lazy"
              draggable="false"
            />
            <span className="pour-mouth" />
          </div>
          <div className="glass-bowl" aria-hidden="true">
            <div className="bowl-shadow"></div>
            <span className="bowl-impact" />
            <svg className="bowl-back" viewBox="0 0 460 230" fill="none">
              <ellipse
                cx="230"
                cy="49"
                rx="218"
                ry="42"
                fill="white"
                fillOpacity=".09"
                stroke="white"
                strokeOpacity=".55"
                strokeWidth="2"
              />
              <ellipse
                cx="230"
                cy="51"
                rx="211"
                ry="35"
                stroke="#78583d"
                strokeOpacity=".2"
                strokeWidth="2"
              />
            </svg>
            <div className="bowl-chips">
              {Array.from({ length: 42 }, (_, i) => (
                <span className="bowl-chip" key={i} />
              ))}
            </div>
            <svg className="bowl-front" viewBox="0 0 460 230" fill="none">
              <defs>
                <linearGradient
                  id="bowl-glass"
                  x1="12"
                  y1="110"
                  x2="448"
                  y2="125"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="white" stopOpacity=".38" />
                  <stop offset=".17" stopColor="white" stopOpacity=".07" />
                  <stop offset=".54" stopColor="white" stopOpacity=".12" />
                  <stop offset=".83" stopColor="white" stopOpacity=".04" />
                  <stop offset="1" stopColor="white" stopOpacity=".4" />
                </linearGradient>
                <linearGradient
                  id="bowl-rim"
                  x1="25"
                  y1="50"
                  x2="430"
                  y2="60"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="white" stopOpacity=".9" />
                  <stop offset=".45" stopColor="white" stopOpacity=".25" />
                  <stop offset="1" stopColor="white" stopOpacity=".95" />
                </linearGradient>
              </defs>
              <path
                d="M12 49C29 157 92 215 230 215C368 215 431 157 448 49C414 104 46 104 12 49Z"
                fill="url(#bowl-glass)"
                stroke="white"
                strokeOpacity=".5"
                strokeWidth="2"
              />
              <path
                d="M13 49C28 104 431 104 447 49"
                stroke="url(#bowl-rim)"
                strokeWidth="5"
              />
              <path
                d="M34 78C46 125 69 160 99 177"
                stroke="white"
                strokeOpacity=".65"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M423 82C412 123 395 149 378 164"
                stroke="white"
                strokeOpacity=".45"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M135 201C187 217 271 217 323 201"
                stroke="white"
                strokeOpacity=".6"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="table-caption micro" aria-hidden="true">
            PULL UP A CHAIR. PASS THE CRUNCH.
          </span>
        </div>
        <button className="pour-replay outline-button" type="button">
          RESTART POUR <span aria-hidden="true">&#8635;</span>
        </button>
        <span className="pour-scroll-label micro">
          SCROLL TO POUR &middot; SCROLL UP TO REWIND
        </span>
        <div className="pour-progress" aria-hidden="true">
          <span></span>
        </div>
      </div>
    </section>
  );
}
