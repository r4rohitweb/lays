# Lay’s Crunch Lab

An independent, noncommercial concept website rebuilt around the supplied video’s motion and page sequence. Built with HTML, CSS, JavaScript, and a custom WebGL pouch renderer. No dependencies or build step.

## Open

Start Apache in XAMPP, then visit http://localhost/testing/lays/.

## Interactions

- Skippable/replayable magenta intro with swirling ridged potato chips, a central spinning chip, and a yellow logo reveal.
- Nine-pack perspective carousel with autoplay, arrows, keyboard controls, swipe/drag, color changes, and concentric backgrounds. Scrolling the opening section advances the lineup.
- A pinned four-chapter scene driven by native scroll position. Forward and reverse scrolling rotate a curved, textured Flamin’ Hot pouch and build into a full-screen red chip storm with a centered pack, depth blur, and a live spin-speed readout. Chapter buttons navigate the sequence. At the end, the Flamin’ Hot packet travels with the scroll into its matching shop card; scrolling back reverses the transition.
- Pointer-reactive shop cards with elastic bag presses, cream labels expanding left from black circular add controls, green remove icons, synchronized builder selection, flying-bag feedback, and a floating three-pack tray. Completed bundles animate toward the basket.
- A three-pack builder with falling bags, three different flavors, individual removal, a three-bag limit, and a concept basket persisted in localStorage.
- A continuously looping hanging-pack rail with seamless wrapping during autoplay, dragging, touch scrolling, and arrow navigation. Pauses on hover or keyboard focus, includes a pause control, and respects reduced-motion preferences. Clicking or tapping a packet flips it to its original back photograph; clicking again returns to the front. Flip state stays synchronized through loop wrapping.
- Q&A accordions, mobile navigation, and opt-in synthesized interaction sounds.
- A dark red newsletter ending with a floating Flamin’ Hot pack, three faint orbital rings with animated chillies and chips, outlined STAY CRUNCHY marquee, Explore/Help columns, credits, and back-to-top controls. The email form validates locally and creates no subscription.
- A full-width wooden-table scene with a transparent glass bowl, 42 varied golden chips with gravity-driven falls, tumbling, landing bounces, contact shadows, bag compression, pointer-reactive glass highlights, a pinned scene where scrolling lifts the packet from the table, tilts it over the bowl, then pours, with the sequence reversing on upward scroll, a progress bar, and a restart control. Reduced-motion mode shows the filled bowl without animation.
- Reduced-motion mode disables autoplay, particles, spinning, and the intro. CSS perspective provides a fallback when WebGL is unavailable.

The basket is a demonstration: there is no checkout, payment processing, or order backend.

## Reference fidelity

The page recreates the principal motion patterns visible in the supplied video. The video’s nine-flavor lineup is included, with locally stored product images. The original source code and 3D models were not supplied. This implementation uses a custom procedural pouch mesh, and an original Flamin’ Hot 2.5 oz reverse-side packet photograph matching UPC 028400768764. The genuine back photograph comes from the Gopuff product gallery; the front comes from PepsiCo SmartLabel. No video of the reference is embedded as website content.

## Files

- `index.html`: page structure, intro, sections, and basket dialog.
- `styles.css`, `flavors.css`, and `storm.css`: responsive composition, nine-flavor layouts, perspective, animation, and reduced-motion styles.
- `app.js`: carousel, scroll choreography, particles, builder, basket, rail, navigation, and sound.
- `footer.css` and `footer.js`: reference-style newsletter/footer, local form feedback, and dark header state.
- `shop-effects.css`: shop-card hover, press, add confirmation, and floating three-pack tray styles.
- `packet-flight.css` and `packet-flight.js`: scroll-driven packet handoff from the red scene into the shop grid.
- `pouch.js`: WebGL shaders, silhouette-aware curved mesh, lighting, and the original packet reverse texture.
- `intro.css` and `intro.js`: animated chip intro, procedural chip textures, and yellow logo transition.
- `bowl.css` and `bowl.js`: responsive glass-bowl scene and scroll-controlled chip-pouring animation.
- `credits.html`: product image attribution.
- `rail-flip.css`: front/back packet faces and persistent flip transitions.
- `assets/rail/`: matched front/back photographs for the hanging lineup, credited to Gopuff.
- `assets/`: local product textures and favicon. Google Fonts loads remotely with local font fallbacks.

## Verification

Run `node scripts/browser-check.cjs` with XAMPP running. Uses installed Chrome and Node’s built-in WebSocket, with no npm dependencies. It checks image loading, carousel selection, WebGL initialization, pinned forward/reverse scroll chapters, chip storm, builder limits/removal/unique flavors, basket persistence and Escape, rail controls and original front/back flips, Q&A, mobile navigation, reduced motion, JavaScript errors, and horizontal overflow at 1440/768/390/320px. The test uses software WebGL to work on machines without a dedicated GPU.

Screenshots and the isolated Chrome profile are saved to ignored `.qa/`. The previous site files are preserved in `.qa/previous-version/`.

## Imagery

PNGimg images are provided under CC BY-NC 4.0; ClipartMax and PNGkey images are used for noncommercial demonstration. The Barbecue, Flamin’ Hot, All Dressed, Sweet Southern Heat Barbecue, and Bacon Grilled Cheese pack images come from PepsiCo SmartLabel. Source links are in `credits.html`. Product trademarks and imagery belong to their respective owners. This website is not affiliated with Lay’s or PepsiCo.
