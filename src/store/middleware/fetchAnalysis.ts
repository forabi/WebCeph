import { isActionOfType } from 'utils/store';
import { fetchAnalysisSucceeded, fetchAnalysisFailed } from 'actions/workspace';
import { Store, Middleware } from 'redux';

declare const require: __WebpackModuleApi.RequireFunction;

const middleware: Middleware = (_: Store<StoreState>) => (next: GenericDispatch) =>
  async (action: Action<any>) => {
    if (!isActionOfType(action, 'SET_ANALYSIS_REQUESTED')) {
      return next(action);
    } else {
      const { imageId, analysisId } = action.payload;
      try {
        await require(`async-module-loader?promise!./analyses/${analysisId}`);
        next(fetchAnalysisSucceeded({ imageId, analysisId}));
      } catch (e) {
        next(fetchAnalysisFailed({
          error: { message: e.message },
          analysisId,
          imageId,
        }));
      }
    }
  };

export default middleware;
