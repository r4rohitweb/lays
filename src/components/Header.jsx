export function Header({ basketCount, onOpenBasket }) {
  return (
    <>
      <header className="header">
        <a className="brand" href="#flavors" aria-label="Lay’s Crunch Lab home">
          <span className="brand-mark">Lay’s</span>
          <span className="brand-name">CRUNCH LAB</span>
        </a>
        <nav className="nav" aria-label="Main navigation">
          <a href="#flavors" className="active">
            Flavors
          </a>
          <a href="#inside">Inside</a>
          <a href="#shop">Shop</a>
          <a href="#range">Range</a>
          <a href="#qa">Q&A</a>
          <a href="#join">Join</a>
        </nav>
        <div className="header-actions">
          <button
            id="sound-toggle"
            className="outline-button"
            aria-pressed="false"
          >
            SOUND <b>OFF</b>
          </button>
          <button
            id="basket-toggle"
            className="outline-button"
            aria-label={`Open concept basket, ${basketCount} bags`}
            onClick={onOpenBasket}
          >
            ♧ <span id="basket-count">{basketCount}</span>
            <span className="basket-dots">○ ○ ○</span>
          </button>
          <a className="pink-button" href="#join">
            First dibs ↗
          </a>
          <button
            className="menu-toggle"
            aria-label="Open navigation"
            aria-expanded="false"
            aria-controls="mobile-nav"
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
      <nav id="mobile-nav" aria-label="Mobile navigation" hidden>
        <a href="#flavors">Flavors</a>
        <a href="#inside">Inside the bag</a>
        <a href="#shop">Shop the flavors</a>
        <a href="#range">The range</a>
        <a href="#qa">Q&A</a>
        <a href="#join">First dibs</a>
      </nav>
    </>
  );
}
