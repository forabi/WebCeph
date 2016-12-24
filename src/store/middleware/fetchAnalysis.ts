import { isActionOfType } from 'utils/store';
import { fetchAnalysisSucceeded, fetchAnalysisFailed } from 'actions/workspace';
import { Store, Middleware } from 'redux';

declare const require: __WebpackModuleApi.RequireFunction;

const middleware: Middleware = (_: Store<StoreState>) => (next: GenericDispatch) =>
  async (action: GenericAction) => {
    if (!isActionOfType(action, 'SET_ANALYSIS_REQUESTED')) {
      return next(action);
    } else {
      const { imageType, analysisId } = action.payload;
      try {
        await require(`async-module-loader?promise!analyses/${analysisId}`);
        next(fetchAnalysisSucceeded({ imageType, analysisId}));
      } catch (e) {
        next(fetchAnalysisFailed({
          error: { message: e.message },
          analysisId,
          imageType,
        }));
      }
    }
  };

export default middleware;
