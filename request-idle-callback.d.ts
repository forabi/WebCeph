declare interface RequestIdleCallbackOptions {
  /**
   * A deadline by which the browser must call the given callback function.
   * This value is given in milliseconds.
   */
  timemout: number;
}

/**
 * The DOMHighResTimeStamp type is a double and is used to store a time value.
 * The value could be a discrete point in time or the difference in time between
 * two discrete points in time. The unit is milliseconds and should be accurate 
 * to 5 µs (microseconds). However, if the browser is unable to provide a 
 * time value accurate to 5 microseconds (due, for example, to hardware or 
 * software constraints), the browser can represent the value as a time in milliseconds
 * accurate to a millisecond.
 */
declare type DOMHighResStamp = number;

declare interface Deadline {
  timeRemaining: () => DOMHighResStamp;
  didTimout: boolean;
}

/**
 * The window.requestIdleCallback() method queues a function to be called
 * during a browser's idle periods. This enables developers to perform
 * background and low priority work on the main event loop,
 * without impacting latency-critical events such as animation and input response.
 * Functions are generally called in first-in-first-out order
 * unless the function's timeout is reached before the browser calls it.
 * @return An unsigned long integer that can be used to cancel the callback using the Window.cancelIdleCallback() method.
 */
declare interface RequestIdleCallback {
  (
    /** A reference to a function that should be called in the near future. */
    callback: (deadline: Deadline) => any,
    /** Contains optional configuration parameters */
    options?: RequestIdleCallbackOptions
  ): number;
}

/**
 * The Window.cancelIdleCallback() enables you to cancel a callback
 * previously scheduled with Window.requestIdleCallback.
 */
declare interface CancelIdleCallback {
  /**
   * The unsigned long integer returned by calling Window.requestIdleCallback.
   */
  handle: number;
}