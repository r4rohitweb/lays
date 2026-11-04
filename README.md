# Lay’s Crunch Lab — React

The existing Crunch Lab website converted to React 19 and Vite, preserving its layout, local product imagery, CSS, and animation timing. All nine flavors, authentic packet backs, scroll scenes, shop effects, three-pack builder, concept basket, and footer remain included.

## Development

Requires Node.js 20.19+ or 22.12+.

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local address printed by Vite, normally http://127.0.0.1:5173/. The `.cmd` form works in PowerShell when its execution policy blocks `npm.ps1`; `npm` also works in other shells.

## Production and XAMPP

```powershell
npm.cmd run build
```

The static production site is generated in `dist/`. With XAMPP Apache running, the included `.htaccess` serves that build at the existing address, http://localhost/testing/lays/. Rebuild after source changes to update the Apache version. The build is also directly accessible at http://localhost/testing/lays/dist/.

For Vite’s production preview, run `npm.cmd run preview`. To deploy elsewhere, upload the contents of `dist/`; relative asset paths support hosting under a subdirectory.

## Source layout

- `src/App.jsx`: composes the page and owns notification state.
- `src/components/`: React sections, reusable product images, builder, basket dialog, and floating tray.
- `src/hooks/useThreePack.js`: React selection/basket state, three-distinct-flavor rule, removal, basket limits, and localStorage persistence.
- `src/hooks/useExperience.js`: mounts the animation engines and disposes them on unmount or hot reload.
- `src/animations/`: carousel/scroll choreography, WebGL pouch renderer, intro, packet handoff, bowl simulation, and footer visibility. Animation frames, timers, listeners, observers, temporary elements, and WebGL resources are cleaned up for React Strict Mode.
- `src/data/flavors.js`: the shared nine-flavor catalog.
- `src/styles/`: the original stylesheets, imported in their original order.
- `public/assets/`: original product images, matched front/back rail photographs, and favicon; copied to `dist/assets/` by Vite.
- `public/credits.html`: image source attribution, copied to the production build.
- `scripts/browser-check.cjs`: Chrome browser regression checks.

React renders the page structure, product lists, selection controls, basket, newsletter feedback, and notifications. The canvas/WebGL and continuous scroll animations run inside a lifecycle-managed effect so their transforms remain smooth without rerendering every frame. The project has no global script entry points or duplicate vanilla application.

## Preserved interactions

- Skippable and replayable magenta chip intro with a yellow logo reveal.
- Nine-flavor perspective carousel with arrows, dots, swipe/drag, keyboard controls, autoplay, and scroll-driven selection.
- Pinned, reversible four-chapter WebGL pouch scene with the real Flamin’ Hot reverse image, chip storm, and scroll-controlled packet handoff into the shop.
- Tilting shop cards, elastic bag presses, expanding add controls, green remove buttons, flying bags, and a floating selection tray.
- Three-pack builder requiring three different flavors; individual removal; concept basket persisted on the device.
- Seamlessly looping hanging rail with paperclips, dragging, arrow navigation, pause control, and synchronized authentic packet-back flips.
- Full-width wooden-table scene: the packet starts on the table, lifts and tilts as you scroll, and pours 42 tumbling chips into a transparent glass bowl. Reverse scrolling rewinds the sequence.
- Q&A accordions, responsive navigation, opt-in synthesized sound, and reduced-motion alternatives.
- Red newsletter/footer with three faint ingredient orbits, animated chillies/chips, floating packet, and STAY CRUNCHY marquee.

The basket and newsletter are local demonstrations. No payments, orders, or subscriptions are created. The previously removed store-locator and social links remain removed.

## Verification

With Apache running and a current production build:

```powershell
npm.cmd test
```

To test the Vite development server instead:

```powershell
$env:SITE_URL = 'http://127.0.0.1:5173/'
npm.cmd test
```

The checks use installed Google Chrome and Node’s built-in WebSocket. They cover local image loading, WebGL initialization, forward/reverse scroll scenes, the bowl pour and rewind, all builder constraints, basket persistence and Escape, original packet backs, looping rail, footer orbits, newsletter feedback, mobile navigation, reduced motion, JavaScript errors, and horizontal overflow at 1440/768/390/320px.

Screenshots and the isolated browser profile are stored in ignored `.qa/`. The pre-conversion source and reference screenshots are preserved in `.qa/pre-react/`; earlier references and backups remain in `.qa/`.

## Imagery and reference

This is an independent, noncommercial design concept inspired by Lay’s and the supplied reference video. Product imagery and trademarks belong to their respective owners. Sources and image-license details are in `public/credits.html`. Google Fonts loads remotely with local font fallbacks. No reference video is embedded as page content.
