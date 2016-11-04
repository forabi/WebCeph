export function printUnexpectedPayloadWarning(type: string, state: any, actualType= 'undefined') {
  console.warn(
    `Did not expect action payload to be ${actualType} for action ` +
    `${type}. ` +
    `Returning current state.`,
    state,
  );
}

export const delay = (timeout: number, resolveValue: any) => {
  return new Promise((resolve) => {
    setTimeout(
      resolve.bind(null, resolveValue),
      timeout,
    );
  });
};
