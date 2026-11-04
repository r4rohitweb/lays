// Every animation belongs to one React effect. Dispose listeners, scheduled
// work, observers, and temporary elements before remounting or hot reloading.
export function createScope() {
  const cleanups = new Set();
  const frames = new Set();
  const timeouts = new Set();
  const intervals = new Set();
  let disposed = false;
  const scope = {
    listen(target, type, handler, options) {
      target.addEventListener(type, handler, options);
      cleanups.add(() => target.removeEventListener(type, handler, options));
    },
    requestAnimationFrame(callback) {
      if (disposed) return 0;
      const id = window.requestAnimationFrame((time) => {
        frames.delete(id);
        if (!disposed) callback(time);
      });
      frames.add(id);
      return id;
    },
    cancelAnimationFrame(id) {
      window.cancelAnimationFrame(id);
      frames.delete(id);
    },
    setTimeout(callback, delay) {
      const id = window.setTimeout(() => {
        timeouts.delete(id);
        if (!disposed) callback();
      }, delay);
      timeouts.add(id);
      return id;
    },
    clearTimeout(id) {
      window.clearTimeout(id);
      timeouts.delete(id);
    },
    setInterval(callback, delay) {
      const id = window.setInterval(callback, delay);
      intervals.add(id);
      return id;
    },
    clearInterval(id) {
      window.clearInterval(id);
      intervals.delete(id);
    },
    IntersectionObserver: class extends window.IntersectionObserver {
      constructor(callback, options) {
        super(callback, options);
        cleanups.add(() => this.disconnect());
      }
    },
    add(cleanup) {
      cleanups.add(cleanup);
      return () => cleanups.delete(cleanup);
    },
    dispose() {
      disposed = true;
      frames.forEach(window.cancelAnimationFrame);
      timeouts.forEach(window.clearTimeout);
      intervals.forEach(window.clearInterval);
      [...cleanups].reverse().forEach((cleanup) => cleanup());
      cleanups.clear();
    },
  };
  return scope;
}
