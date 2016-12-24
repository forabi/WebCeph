export function createAction<T extends ActionType>(type: T, payload: Events[T]): Action<T> {
  return {
    type,
    payload,
  };
};

export function createActionCreator<T extends ActionType>(type: T): ActionCreator<T> {
  return (payload: Events[T]) => createAction<T>(type, payload);
};

export function handleActions<Key extends StoreKey>(
  map: ActionToReducerMap<Key>, defaultState: StoreState[Key]
): Reducer<StoreState[Key], ActionType> {
  return (state: StoreState[Key], action: Action<ActionType>) => {
    const reducer: Reducer<StoreState[Key], typeof action['type']> | undefined = map[action.type];
    if (typeof reducer !== 'undefined') {
      return reducer(state, action);
    }
    if (typeof state !== 'undefined') {
      return state;
    }
    return defaultState;
  };
}

export function isActionOfType<T extends ActionType>(action: GenericAction, type: T): action is Action<T> {
  return type === action.type;
}
