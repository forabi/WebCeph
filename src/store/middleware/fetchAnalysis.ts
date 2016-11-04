import { Event } from 'utils/constants';
import { Store, Dispatch, Middleware } from 'redux';

declare const require: __WebpackModuleApi.RequireFunction;

require.context('analyses', false, /.ts$/i);

const middleware: Middleware = (_: Store<any>) => (next: Dispatch<any>) => async (action: Action<any>) => {
  const { type, payload } = action;
  if (type === Event.SET_ANALYSIS_REQUESTED) {
    const analysisId: Payloads.analysisLoadRequested = payload;
    require.ensure([], (require) => {
      try {
        // const analysis: Analysis = require(`analyses/${analysisId}`);
        // console.log('Fetched!', analysis, typeof analysis, analysis);
        return next({
          type: Event.SET_ANALYSIS_SUCCEEDED,
          payload: payload as Payloads.analysisLoadSucceeded,
        });
      } catch (e) {
        console.log('Failed', e);
        return next({
          type: Event.SET_ANALYSIS_FAILED,
          error: true,
          payload: { message: e.message } as Payloads.analysisLoadFailed,
        });
      }
    });
  } else {
    return next(action);
  }
};

export default middleware;
