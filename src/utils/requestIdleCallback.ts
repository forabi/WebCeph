declare var window: Window & { requestIdleCallback?: RequestIdleCallback };

// @TODO: replace with a polyfill?
const requestIdleCallback = window.requestIdleCallback || ((fn: Function) => fn());

export default requestIdleCallback;

export function scheduleForIdle<T>(fn: Function) {
  return (...args: T[]) => {
    requestIdleCallback(() => fn(...args));
  };
};
