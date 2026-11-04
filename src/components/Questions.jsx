export function Questions() {
  return (
    <section id="qa" className="qa section-pad">
      <div className="qa-title">
        <span className="micro">05 — LITTLE QUESTIONS</span>
        <h2>Q&A</h2>
        <p>
          Everything you want to know
          <br />
          before the next crunch.
        </p>
      </div>
      <div className="questions">
        <details>
          <summary>
            Are the chips made from real potatoes?<span>+</span>
          </summary>
          <p>
            Yes. Lay’s potato chips start with real potatoes. Follow the
            official product links for the ingredients in each flavor.
          </p>
        </details>
        <details>
          <summary>
            Which flavor should I try first?<span>+</span>
          </summary>
          <p>
            Start with Classic for a golden crunch, or explore Sour Cream &
            Onion, Barbecue, Salt & Vinegar, Flamin’ Hot, Cheddar & Sour Cream,
            All Dressed, Sweet Southern Heat Barbecue, and Bacon Grilled Cheese
            in the lineup.
          </p>
        </details>
        <details>
          <summary>
            How do I keep an open bag crunchy?<span>+</span>
          </summary>
          <p>
            Squeeze out the air, roll the top down, clip it, and store it
            somewhere cool and dry. Always follow the storage guidance on your
            pack.
          </p>
        </details>
        <details>
          <summary>
            Where can I find allergen information?<span>+</span>
          </summary>
          <p>
            Check the label on your bag and the{" "}
            <a
              href="https://www.lays.com/products"
              target="_blank"
              rel="noopener"
            >
              official product pages ↗
            </a>
            . Ingredients and allergens vary by product and market.
          </p>
        </details>
        <details>
          <summary>
            Is this an official website?<span>+</span>
          </summary>
          <p>
            This is an independent design concept inspired by Lay’s. The box
            builder and basket are interactive demonstrations. No purchases are
            processed.
          </p>
        </details>
      </div>
    </section>
  );
}
