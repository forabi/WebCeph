declare var window: Window & { requestIdleCallback?: RequestIdleCallback };

// @TODO: replace with a polyfill?
const rIC = window.requestIdleCallback || ((fn: Function) => fn());

export default rIC;
