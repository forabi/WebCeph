import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';

import App from './index';
import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';

import {
  areResultsShown,
  canShowResults,
} from 'store/reducers/workspace/analysis';


const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (enhancedState: EnhancedState<StoreState>) => {
    const { present: state } = enhancedState;
    return {
      isSummaryShown: areResultsShown(state) && canShowResults(state),
    };
  };

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (_) => (
    {

    }
  );

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(App);


export default connected;
