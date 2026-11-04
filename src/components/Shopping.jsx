import { useEffect, useState } from "react";
import { flavors, byId } from "../data/flavors.js";
import { ProductImage } from "./ProductImage.jsx";

export function Shop({ pack }) {
  return (
    <section id="shop" className="shop section-pad">
      <div className="section-top">
        <div>
          <span className="micro">03 — YOUR NEXT GOOD IDEA</span>
          <h2>
            GRAB
            <br />A BAG.
          </h2>
        </div>
        <p>
          Tilt a card. Poke the bag. Hit <b>+</b>
          <br />
          to drop a flavor into your box.
        </p>
      </div>
      <div id="shop-grid" className="shop-grid">
        {flavors.map((flavor) => {
          const selected = pack.bundle.includes(flavor.id);
          return (
            <article
              key={flavor.id}
              className={`shop-card${selected ? " in-box" : ""}`}
              style={{ "--card-color": flavor.color, "--card-ink": flavor.ink }}
            >
              <h3>{flavor.name.toUpperCase()}</h3>
              <button
                className="card-image"
                aria-label={`Poke the ${flavor.name} bag`}
              >
                <ProductImage flavor={flavor} />
                <span className="poke-hint" aria-hidden="true">
                  POKE ME
                </span>
              </button>
              <div className="card-bottom">
                <p>{flavor.note}</p>
                <button
                  className={`add-bag${selected ? " selected" : ""}`}
                  data-add={flavor.id}
                  aria-pressed={selected}
                  aria-label={`${selected ? "Remove" : "Add"} ${flavor.name} ${selected ? "from" : "to"} your three-pack`}
                  onClick={(event) =>
                    pack.toggleBag(flavor.id, event.currentTarget)
                  }
                >
                  <span className="add-label">ADD TO BOX</span>
                  <span className="add-symbol" aria-hidden="true">
                    {selected ? "×" : "+"}
                  </span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <div className="shop-bottom micro">
        <span>DIFFERENT FLAVORS. SAME HAPPY FEELING.</span>
        <a href="#builder">BUILD YOUR OWN THREE-PACK ↗</a>
      </div>
    </section>
  );
}

export function Builder({ pack }) {
  return (
    <section
      className="builder-section"
      id="builder"
      aria-labelledby="builder-title"
    >
      <div className="builder-panel">
        <div className="builder-copy">
          <span className="micro">MIX-IT-UP / CRUNCH YOUR WAY</span>
          <h2 id="builder-title">
            BUILD YOUR
            <br />3 PACK.
            <br />
            <span>MAKE IT YOU.</span>
          </h2>
          <div
            id="builder-options"
            className="builder-options"
            role="group"
            aria-label="Select three different flavors"
          >
            {flavors.map((flavor) => {
              const selected = pack.bundle.includes(flavor.id);
              return (
                <button
                  key={flavor.id}
                  className={`builder-option${selected ? " selected" : ""}`}
                  data-pick={flavor.id}
                  disabled={selected}
                  aria-pressed={selected}
                  aria-label={
                    selected
                      ? `${flavor.name} already in your box; remove the bag to choose it again`
                      : `Add ${flavor.name} to your three-pack`
                  }
                  onClick={() => pack.addBag(flavor.id)}
                >
                  <span>{flavor.name.toUpperCase()}</span>
                  <ProductImage flavor={flavor} />
                  <b>{selected ? "✓" : "+"}</b>
                </button>
              );
            })}
          </div>
          <p className="micro builder-help">
            PICK 3 DIFFERENT FLAVORS.
            <br />
            YOUR BOX, YOUR RULES.
          </p>
        </div>
        <div className="builder-display">
          <div className="builder-glow"></div>
          <div
            id="pack-slots"
            className="pack-slots"
            aria-label="Your selected three-pack"
          >
            {Array.from({ length: 3 }, (_, index) => {
              const id = pack.bundle[index];
              return (
                <div
                  key={`${index}-${id || "empty"}`}
                  className={`pack-slot${id ? " filled" : ""}`}
                  data-flavor={id || ""}
                >
                  {id ? (
                    <>
                      <ProductImage flavor={byId[id]} eager />
                      <button
                        className="remove-slot"
                        aria-label={`Remove ${byId[id].name} from slot ${index + 1}`}
                        onClick={() => pack.removeSlot(index)}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <span className="slot-number">{index + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
          <button
            id="add-bundle"
            className="bundle-button"
            disabled={pack.bundle.length !== 3}
            onClick={pack.addBundle}
          >
            <span>
              {pack.bundle.length === 3
                ? "ADD TO BASKET"
                : `PICK ${3 - pack.bundle.length} ${pack.bundle.length === 2 ? "MORE" : "BAGS"}`}
            </span>
            <span id="bundle-progress">{pack.bundle.length} / 3</span>
          </button>
          <span className="micro concept-note">
            CONCEPT EXPERIENCE · NO PAYMENT OR ORDERS
          </span>
        </div>
      </div>
    </section>
  );
}

export function MixTray({ bundle }) {
  const [builderVisible, setBuilderVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => setBuilderVisible(entries[0].isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(document.getElementById("builder"));
    return () => observer.disconnect();
  }, []);
  return (
    <a
      className="mix-tray"
      href="#builder"
      hidden={builderVisible || !bundle.length}
    >
      <span className="mix-tray-bags" aria-hidden="true">
        {bundle.map((id) => (
          <ProductImage key={id} flavor={byId[id]} eager />
        ))}
      </span>
      <span className="mix-tray-label" role="status" aria-live="polite">
        YOUR THREE-PACK · {bundle.length} / 3 · VIEW BOX
      </span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

export function Basket({ pack, dialogRef }) {
  useEffect(() => {
    const dialog = dialogRef.current;
    const unlock = () => {
      document.body.style.overflow = "";
    };
    dialog.addEventListener("close", unlock);
    return () => {
      dialog.removeEventListener("close", unlock);
      unlock();
    };
  }, [dialogRef]);
  return (
    <dialog
      ref={dialogRef}
      id="basket-dialog"
      aria-labelledby="basket-title"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          event.currentTarget.close();
      }}
    >
      <div className="dialog-heading">
        <span className="micro">YOUR CONCEPT BASKET</span>
        <button
          className="dialog-close"
          aria-label="Close basket"
          onClick={() => dialogRef.current.close()}
        >
          ×
        </button>
      </div>
      <h2 id="basket-title">
        GOOD
        <br />
        CHOICES.
      </h2>
      <div id="basket-items">
        {pack.basketRows.length ? (
          pack.basketRows.map((flavor) => (
            <div key={flavor.id} className="basket-row">
              <ProductImage flavor={flavor} eager />
              <div>
                <p>{flavor.name}</p>
                <span>
                  {flavor.count} {flavor.count === 1 ? "BAG" : "BAGS"}
                </span>
              </div>
              <button
                data-remove-basket={flavor.id}
                aria-label={`Remove one ${flavor.name} bag`}
                onClick={() => pack.removeBasket(flavor.id)}
              >
                −
              </button>
            </div>
          ))
        ) : (
          <p className="basket-empty">
            Your next good moment starts with a bag.
            <br />
            Build a three-pack to fill your basket.
          </p>
        )}
      </div>
      <p className="basket-disclaimer">
        This is a concept basket. No payment or orders are processed.
      </p>
      <button
        id="clear-basket"
        className="outline-button"
        disabled={!pack.basket.length}
        onClick={pack.clearBasket}
      >
        CLEAR BASKET ↗
      </button>
    </dialog>
  );
}
