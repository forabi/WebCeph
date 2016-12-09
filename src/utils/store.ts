export function createAction(type: keyof Events, payload: Events[typeof type]): Action<typeof type> {
  return {
    type,
    payload,
  };
};

export function createActionCreator<K extends keyof Events>(type: K) {
  return (payload: Events[K]) => createAction(type, payload);
};