/**
 * The ResizeObserver API is an interface for observing changes to Element's content rect's width and height.
 * It is an Element's counterpart to window.resize event.
 * @see https://wicg.github.io/ResizeObserver/
 */
declare class ResizeObserver {
  constructor(callback: ResizeObserverCallback);
  /** Adds target to the list of observed elements. */
  observe(target: Element): void;

  /** Removes target from the list of observed elements. */
  unobserve(target: Element): void;
  disconnect(): void;
}

/**
 * This callback delivers ResizeObserver's notifications.
 * It is invoked by a broadcast active observations algorithm.
 */
declare type ResizeObserverCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void;

declare interface ResizeObserverEntry {
    readonly target: Element;
    readonly contentRect: {
      /** width is content width */
      width: number;

      /** height is content height */
      height: number;

      /** top is padding top */
      top: number;

      /** left is padding left */
      left: number;
    };
}