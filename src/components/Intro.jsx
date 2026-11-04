export function Intro() {
  return (
    <div className="intro" aria-label="Loading Crunch Lab">
      <button className="outline-button skip-intro">SKIP INTRO ↗</button>
      <div className="intro-yellow" aria-hidden="true"></div>
      <canvas className="intro-chips" aria-hidden="true"></canvas>
      <div className="intro-logo" aria-hidden="true">
        <span className="brand-mark">Lay’s</span>
      </div>
      <span className="intro-label">A WORLD OF CRUNCH.</span>
      <span className="intro-progress">
        100<span>%</span>
      </span>
    </div>
  );
}
