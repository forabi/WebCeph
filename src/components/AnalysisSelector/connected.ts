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
  getActiveAnalysisId,
  isAnalysisLoading,
} from 'store/reducers/workspace/analyses';

const analyses = [
  'downs',
  'basic',
  'common',
  'dental',
  'bjork',
  'softTissues',
];

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: StoreState): StateProps => {
    return {
      analyses,
      currentAnalysisId: 'basic',
      isLoading: false,
    };
  };

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (dispatch: GenericDispatch): DispatchProps => {
    return {
      onChange: (analysisId, imageType) => dispatch(setAnalysis({ analysisId, imageType })),
    };
  };

export default connect(
  mapStateToProps, mapDispatchToProps
)(AnalysisSelector);
