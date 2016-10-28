import { Event } from 'utils/constants';
import { Store, Dispatch, Middleware } from 'redux';

declare const require: __WebpackModuleApi.RequireFunction;

const middleware: Middleware = (_: Store<any>) => (next: Dispatch<any>) => (action: Action<any>) => {
  const { type, payload } = action;
  if (type === Event.SET_ACTIVE_ANALYSIS_REQUESTED) {
    try {
      const analysisId: Payloads.analysisLoadRequested = payload;
      require.ensure([`analyses/${analysisId}`], (_) => {
        return next({
          type: Event.FETCH_ANALYSIS_SUCCEEDED,
          payload: payload as Payloads.analysisLoadSucceeded,
        });
      });
      return;
    } catch (e) {
      return next({
        type: Event.FETCH_ANALYSIS_FAILED,
        error: true,
        payload: { message: e.message } as Payloads.analysisLoadFailed,
      });
    }
  } else {
    return next(action);
  }
};

export default middleware;
