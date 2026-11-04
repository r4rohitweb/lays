const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const qa = path.resolve('.qa');
  fs.mkdirSync(qa, { recursive: true });
  const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-features=CalculateNativeWinOcclusion', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9337', `--user-data-dir=${path.join(qa, 'chrome-profile')}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let ws;
  try {
    let tabs;
    for (let i = 0; i < 60; i++) {
      try { tabs = await (await fetch('http://127.0.0.1:9337/json')).json(); break; } catch { await delay(250); }
    }
    assert(tabs, 'Chrome debugging endpoint ready');
    ws = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
    await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
    let next = 0;
    const pending = new Map();
    const errors = [];
    ws.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const waiter = pending.get(message.id);
        pending.delete(message.id);
        message.error ? waiter.reject(message.error) : waiter.resolve(message.result);
      }
      if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    });
    const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++next; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
    const evaluate = async expression => {
      const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    await send('Runtime.enable');
    await send('Page.enable');
    await send('Emulation.setFocusEmulationEnabled', { enabled: true });
    await send('Network.enable');
    await send('Network.setCacheDisabled', { cacheDisabled: true });
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: 'http://localhost/testing/lays/' });
    await send('Page.bringToFront');
    await delay(2600);
    await evaluate('document.fonts.ready.then(() => true)');
    await evaluate(`document.querySelector('.skip-intro').click(); document.documentElement.style.scrollBehavior = 'auto'; if(document.querySelector('#autoplay-toggle').getAttribute('aria-pressed')==='true')document.querySelector('#autoplay-toggle').click(); localStorage.removeItem('crunch-lab-basket'); document.querySelector('#clear-basket').click();`);
    const images = await evaluate(`Promise.all([...document.images].map(async image => { image.loading = 'eager'; try { await image.decode(); } catch {} return { src: image.getAttribute('src'), loaded: image.naturalWidth > 0 }; }))`);
    assert(images.every(image => image.loaded), JSON.stringify(images));
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'Desktop has no horizontal overflow');
    await evaluate(`document.querySelector('#next-flavor').click()`);
    await delay(250);
    assert.equal(await evaluate(`document.querySelector('#flavor-title').textContent`), 'SOUR CREAM & ONION');
    await evaluate(`document.querySelector('[data-dot="0"]').click()`);
    await delay(1000);
    const screenshot = async name => { const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); fs.writeFileSync(path.join(qa, name + '.png'), Buffer.from(shot.data, 'base64')); };
    await screenshot('desktop');
    assert.equal(await evaluate(`document.querySelector('.pouch-stage').classList.contains('webgl-ready')`), true, 'WebGL pouch initialized');
    for (const [fraction, chapter] of [[0,0],[.18,0],[.36,1],[.65,2],[.95,3],[.05,0]]) {
      await evaluate(`window.scrollTo({top:document.querySelector('#inside').offsetTop+(document.querySelector('#inside').offsetHeight-innerHeight)*${fraction},behavior:'instant'})`);
      await delay(750);
      assert.equal(await evaluate(`document.querySelector('[data-chapter="${chapter}"]').getAttribute('aria-pressed')`), 'true', `Scroll chapter at ${fraction}`);
      const stickyTop = await evaluate(`document.querySelector('.inside-stage').getBoundingClientRect().top`);
      assert(Math.abs(stickyTop) < 2, 'Inside stage stays pinned');
      if (fraction === .18) await screenshot('inside-back');
      if (fraction === .95) {
        assert(await evaluate(`[...document.querySelectorAll('.flying-chip')].some(chip=>Number(chip.style.opacity)>.8)`), 'Chip storm appears');
        await screenshot('chip-storm');
      }
    }
    await evaluate(`document.querySelector('#shop').scrollIntoView({behavior:'instant'}); document.querySelector('[data-add="classic"]').click(); document.querySelector('[data-add="vinegar"]').click(); document.querySelector('[data-add="sour"]').click();`);
    assert.equal(await evaluate(`document.querySelectorAll('.pack-slot.filled').length`), 3);
    assert.equal(await evaluate(`document.querySelector('#add-bundle').disabled`), false);
    await evaluate(`document.querySelector('[data-pick="bbq"]').click()`);
    assert.equal(await evaluate(`document.querySelectorAll('.pack-slot.filled').length`), 3, 'Cannot overfill the box');
    await screenshot('shop');
    await evaluate(`document.querySelector('#builder').scrollIntoView({behavior:'instant'})`);
    await delay(700); await screenshot('builder');
    await evaluate(`document.querySelector('.remove-slot').click()`);
    assert.equal(await evaluate(`document.querySelector('#add-bundle').disabled`), true, 'Removing a bag disables incomplete bundle');
    assert.equal(await evaluate(`document.querySelector('[data-pick="classic"]').disabled`), false, 'Removed flavor can be selected again');
    assert.equal(await evaluate(`document.querySelector('[data-pick="sour"]').disabled`), true, 'Selected flavors cannot be repeated');
    await evaluate(`document.querySelector('[data-pick="sour"]').click()`);
    assert.equal(await evaluate(`document.querySelectorAll('.pack-slot.filled').length`), 2, 'Duplicate selection does not fill another slot');
    await evaluate(`document.querySelector('[data-pick="bacon"]').click(); document.querySelector('#add-bundle').click()`);
    assert.equal(await evaluate(`document.querySelector('#basket-count').textContent`), '3');
    assert.equal(await evaluate(`document.querySelectorAll('.pack-slot.filled').length`), 0, 'Bundle resets after adding');
    assert.equal(await evaluate(`document.querySelectorAll('[data-pick]:disabled').length`), 0, 'All flavors are enabled for the next pack');
    await evaluate(`document.querySelector('#basket-toggle').click()`);
    assert.equal(await evaluate(`document.querySelector('#basket-dialog').open`), true);
    assert.equal(await evaluate(`document.querySelectorAll('.basket-row').length`), 3, 'Three different flavors appear in basket');
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    assert.equal(await evaluate(`document.querySelector('#basket-dialog').open`), false, 'Escape closes basket');
    await evaluate(`document.querySelector('#range').scrollIntoView({behavior:'instant'}); document.querySelector('#rail-right').click()`);
    await delay(600);
    assert(await evaluate(`document.querySelector('.range-viewport').scrollLeft>100`), 'Rail navigation scrolls horizontally');
    await send('Emulation.setDeviceMetricsOverride', { width: 1906, height: 1000, deviceScaleFactor: 1, mobile: false });
    await evaluate(`document.querySelector('#range').scrollIntoView({behavior:'instant'})`);
    // Arrow navigation pauses autoplay for 1.4 seconds before it resumes.
    await delay(1500);
    await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const loopStart = await evaluate(`document.querySelector('.range-viewport').scrollLeft`);
    let loopMoved = false;
    for (let attempt = 0; attempt < 10 && !loopMoved; attempt++) {
      await delay(250);
      loopMoved = await evaluate(`document.querySelector('.range-viewport').scrollLeft`) > loopStart + 8;
    }
    assert(loopMoved, 'Rail automatically moves while visible');
    await evaluate(`document.querySelector('#rail-autoplay').click()`);
    const paused = await evaluate(`document.querySelector('.range-viewport').scrollLeft`);
    await delay(250);
    assert.equal(await evaluate(`document.querySelector('.range-viewport').scrollLeft`), paused, 'Pause stops rail');
    for (const edge of ['0', 'rail.scrollWidth - rail.clientWidth']) {
      await evaluate(`{ const rail=document.querySelector('.range-viewport');rail.scrollLeft=${edge}; }`);
      await delay(100);
      const coverage = await evaluate(`{ const rail=document.querySelector('.range-viewport'),r=rail.getBoundingClientRect(),items=[...rail.querySelectorAll('.rail-item')].map(item=>item.getBoundingClientRect()).filter(item=>item.right>r.left&&item.left<r.right);({left:items[0].left-r.left,right:r.right-items[items.length-1].right,scroll:rail.scrollLeft,max:rail.scrollWidth-rail.clientWidth}); }`);
      assert(coverage.left < 40 && coverage.right < 40 && coverage.scroll > 0 && coverage.scroll < coverage.max, 'Rail wraps both ends without blank space');
    }
    await screenshot('looping-rail');
    await evaluate(`document.querySelector('#rail-autoplay').click()`);
    await evaluate(`document.querySelector('.rail-item:not([aria-hidden]) [data-rail-flavor="dressed"]').click()`);
    assert.equal(await evaluate(`document.querySelectorAll('[data-rail-flavor="dressed"][aria-pressed="true"]').length`), 7, 'Original back is shown across every loop copy');
    assert.equal(await evaluate(`document.querySelector('[data-rail-flavor="dressed"] .rail-back').getAttribute('aria-hidden')`), 'false', 'Back image is exposed to assistive technology');
    await evaluate(`document.querySelector('.rail-item:not([aria-hidden]) [data-rail-flavor="dressed"]').click()`);
    assert.equal(await evaluate(`document.querySelectorAll('[data-rail-flavor="dressed"].is-flipped').length`), 0, 'Second click returns every copy to the front');
    await evaluate(`document.querySelector('.questions summary').click()`);
    assert.equal(await evaluate(`document.querySelector('.questions details').open`), true);
    for (const width of [768, 390, 320]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: width < 768 });
      await delay(200);
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `No overflow at ${width}px`);
      if (width === 390) {
        await evaluate(`document.querySelector('.menu-toggle').click()`);
        assert.equal(await evaluate(`document.querySelector('#mobile-nav').hidden`), false);
        await evaluate(`document.querySelector('#mobile-nav a').click()`);
        assert.equal(await evaluate(`document.querySelector('#mobile-nav').hidden`), true);
        await evaluate("document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo({top:0,behavior:'instant'})");
        await delay(700);
        await screenshot('mobile');
        await evaluate(`document.querySelector('#inside').scrollIntoView({behavior:'instant'})`);
        await delay(600); await screenshot('mobile-inside');
      }
    }
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.carousel-pack img')).animationName`), 'none');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.flying-chip')).display`), 'none');
    await send('Page.reload'); await delay(1600);
    assert.equal(await evaluate(`document.querySelector('#basket-count').textContent`), '3', 'Basket survives reload');
    await evaluate(`document.querySelector('#clear-basket').click()`);
    assert.deepEqual(errors, [], 'No uncaught JavaScript errors');
    console.log('PASS: all images; desktop and 768/390/320px layouts; carousel; WebGL; pinned forward/reverse scroll chapters; chip storm; three-pack limits/removal/unique flavors; basket/persistence/Escape; rail; Q&A; mobile navigation; reduced motion; no JavaScript errors.');
    await send('Browser.close');
  } finally {
    if (ws) ws.close();
    browser.kill();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
