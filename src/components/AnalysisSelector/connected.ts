import {
  MapDispatchToPropsFunction,
  MapStateToProps,
  connect,
} from 'react-redux';

import AnalysisSelector from './index';
import { DispatchProps, OwnProps, StateProps } from './props';

import {
  setAnalysis,
} from 'actions/workspace';

import {
  getActiveAnalysisIdForImage,
  isAnalysisLoading,
} from 'store/reducers/workspace/analysis';
import {
  getActiveImageQuery,
} from 'store/reducers/workspace/image';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: FinalState): StateProps => {
    const query = getActiveImageQuery(state);
    return {
      analyses: [
        'downs',
        'basic',
        'common',
        'dental',
        'bjork',
      ],
      currentAnalysisId: getActiveAnalysisIdForImage(state, query),
      isLoading: isAnalysisLoading(state),
    };
  };

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (dispatch: DispatchFunction): DispatchProps => {
    return {
      onChange: (id) => dispatch(setAnalysis(id)),
    };
  };

export default connect(
  mapStateToProps, mapDispatchToProps
)(AnalysisSelector);
