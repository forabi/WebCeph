export function printUnexpectedPayloadWarning(type: string, state: any) {
  __DEBUG__ && console.warn(
    'Did not expect action payload to be undefined for action ' +
    type + '. ' +
    'Returning current state.',
    state,
  );
}
