export function createAction(type: keyof Events, payload: Events[typeof type]): Action<typeof type> {
  return {
    type,
    payload,
  };
};

export function createActionCreator<K extends keyof Events>(type: K) {
  return (payload: Events[K]) => createAction(type, payload);
};

export function handleActions<S extends StoreEntry>(map: ActionToReducerMap<S>, defaultState: StoreState[S]): Reducer<S, any> {
  return (state: StoreState[S], action: Action<ActionType>) => {
    const reducer: Reducer<S, typeof action['type']> | undefined = map[action.type];
    if (reducer !== undefined) {
      return reducer(state, action);
    }
    if (typeof state !== 'undefined') {
      return state;
    }
    return defaultState;
  };
}