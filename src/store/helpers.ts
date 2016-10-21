type Reducer<State, Action> = (state: State, action: Action) => State;

/**
 * Creates a reducer that calls the specific reducer and returns the default state if the supplied reducer returns undefined
 */
export function wrapWithDefaultState<State, Action>(reducer: Reducer<State, Action>, defaultState: State) {
  return (state: State, action: Action) => {
    const newState = reducer(state, action);
    if (newState === undefined) {
      return defaultState;
    }
    return newState;
  };
}

import reduce from 'lodash/reduce';

/**
 * Creates a reducer composed of an array of reducers called in order
 */

export function combineReducers<State, Action>(...reducers: Array<Reducer<State, Action>>) {
  return (previous: State, current: Action) => {
    return reduce<Reducer<State, Action>, State>(
      reducers,
      (p: State, r: Reducer<State, Action>) => r(p, current),
      previous,
    );
  };
}