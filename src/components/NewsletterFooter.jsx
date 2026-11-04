import { useState } from "react";

export function NewsletterFooter() {
  const [status, setStatus] = useState("");
  return (
    <section
      id="join"
      className="join reference-ending"
      aria-labelledby="newsletter-title"
    >
      <div className="newsletter-scene">
        <div className="newsletter-copy">
          <span className="micro">GET A LITTLE CLOSER TO THE CRUNCH</span>
          <h2 id="newsletter-title">
            FIRST DIBS
            <br />
            ON NEW
            <br />
            FLAVORS.
          </h2>
          <p>
            Fresh drops, bold new flavors, and the good stuff.
            <br />
            Be first in line for your next favorite.
          </p>
          <form
            className="newsletter-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!event.currentTarget.reportValidity()) return;
              setStatus(
                "THANKS FOR TRYING THE CONCEPT. NO SUBSCRIPTION HAS BEEN CREATED.",
              );
              event.currentTarget.reset();
            }}
          >
            <label className="footer-input-label" htmlFor="newsletter-email">
              YOUR EMAIL
            </label>
            <div className="newsletter-input-row">
              <input
                id="newsletter-email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                autoComplete="email"
                required
                aria-describedby="newsletter-note"
              />
              <button type="submit" aria-label="Try the newsletter sign-up">
                &#8599;
              </button>
            </div>
            <small id="newsletter-note">
              CONCEPT SIGN-UP ONLY. NO SUBSCRIPTION IS CREATED.
            </small>
          </form>
          <div className="newsletter-status" role="status" aria-live="polite">
            {status}
          </div>
        </div>
        <div className="newsletter-pack" aria-hidden="true">
          <div className="flavor-orbits" aria-hidden="true">
            <svg className="orbit-defs" width="0" height="0" aria-hidden="true">
              <defs>
                <linearGradient
                  id="orbit-chilli"
                  x1="26"
                  y1="24"
                  x2="73"
                  y2="80"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#ff782f" />
                  <stop offset=".4" stopColor="#e72c16" />
                  <stop offset="1" stopColor="#8d090d" />
                </linearGradient>
                <radialGradient id="orbit-chip" cx=".3" cy=".25" r=".8">
                  <stop stopColor="#ffecaa" />
                  <stop offset=".55" stopColor="#ebbf65" />
                  <stop offset="1" stopColor="#b67625" />
                </radialGradient>
              </defs>
            </svg>
            {[0, 1, 2].map((index) => (
              <div key={index} className={`flavor-orbit flavor-orbit-${index}`}>
                <span className="orbit-ingredient orbit-chilli">
                  <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
                    <path
                      d="M69 26C72 11 82 8 89 12"
                      stroke="#438539"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    <path
                      d="M68 27C86 36 77 61 55 74C35 87 16 86 9 82C37 79 48 57 48 42C48 30 57 22 68 27Z"
                      fill="url(#orbit-chilli)"
                      stroke="#8f150c"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M58 34C68 32 69 42 64 52"
                      stroke="#ffbc8677"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path d="M57 28L67 22L77 30L69 34Z" fill="#4a852d" />
                  </svg>
                </span>
                <span className="orbit-ingredient orbit-crisp">
                  <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
                    <path
                      d="M46 8C76 1 94 30 86 59C80 88 53 99 30 87C5 74 7 45 19 26C26 16 33 12 46 8Z"
                      fill="url(#orbit-chip)"
                      stroke="#d49c41"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M24 31C17 51 22 71 38 82M34 21C24 45 29 69 47 88M45 16C34 42 40 69 57 87M56 15C47 37 51 64 67 80M66 19C59 38 64 58 76 67"
                      stroke="#fff0ad"
                      strokeOpacity=".65"
                      strokeWidth="2"
                    />
                    <path
                      d="M29 29L30 30M54 65L55 66M63 32L64 33M35 65L36 66"
                      stroke="#a9642580"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </div>
            ))}
          </div>
          <img
            src="assets/flamin.png"
            alt=""
            loading="lazy"
            draggable="false"
          />
        </div>
      </div>
      <footer className="crunch-footer">
        <div className="footer-marquee" aria-hidden="true">
          <div className="footer-marquee-track">
            <span>STAY CRUNCHY &mdash;</span>
            <span>STAY CRUNCHY &mdash;</span>
          </div>
        </div>
        <div className="footer-main">
          <a
            className="footer-brand"
            href="#flavors"
            aria-label="Crunch Lab home"
          >
            <span className="brand-mark">Lay&#8217;s</span>
            <span className="micro">CRUNCH LAB &middot; EST. 2026</span>
          </a>
          <div className="footer-links">
            <div>
              <h3>EXPLORE</h3>
              <nav aria-label="Explore">
                <a href="#flavors">Flavors</a>
                <a href="#inside">Inside</a>
                <a href="#range">Range</a>
                <a href="#builder">Build a box</a>
              </nav>
            </div>
            <div>
              <h3>HELP</h3>
              <nav aria-label="Help">
                <a href="#qa">Q&amp;A</a>
                <a href="#newsletter-title">Newsletter</a>
              </nav>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            INDEPENDENT CONCEPT PROJECT. LAY'S IS A TRADEMARK OF PEPSICO, INC.
            NOT AFFILIATED OR ENDORSED. PRODUCT IMAGE SOURCES IN CREDITS.
          </p>
          <div className="footer-utility">
            <a href="credits.html">CREDITS</a>
            <button id="replay-intro" type="button">
              REPLAY INTRO &#8635;
            </button>
            <a href="#flavors">BACK TO TOP &#8593;</a>
          </div>
        </div>
      </footer>
    </section>
  );
}
