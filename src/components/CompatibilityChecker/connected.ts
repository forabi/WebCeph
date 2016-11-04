import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
  MergeProps,
} from 'react-redux';
import assign from 'lodash/assign';
import noop from 'lodash/noop';
import CompatibilityChecker from './index';
import { currentBrowser, getApplicapleBrowsers } from 'utils/browsers';
import {
  StateProps,
  DispatchProps,
  OwnProps,
  ConnectableProps,
} from './props';
import {
  isCheckingCompatiblity,
  isBrowserCompatible,
  getMissingFeatures,
} from 'store/reducers/env/compatibility';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = (state: FinalState) => {
  return {
    shouldUpgradeCurrentBrowser: isBrowserCompatible(state),
    missingFeatures: getMissingFeatures(state),
    isChecking: isCheckingCompatiblity(state),
    open: isCheckingCompatiblity(state),
    isNerdMode: false,
    currentBrowser,
    recommendedBrowsers: getApplicapleBrowsers(true),
  };
};

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> = (_) => (
  {
    onDialogClosed: noop, // @TODO: Ignore compatiblity check? Is this a good idea?
  }
);

const mergeProps: MergeProps<StateProps, DispatchProps, OwnProps> = (stateProps, dispatchProps): ConnectableProps => {
  return assign(
    { },
    stateProps,
    dispatchProps,
  );
};

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps, mergeProps
)(CompatibilityChecker);


export default connected;
