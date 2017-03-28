import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';
import noop from 'lodash/noop';
import CompatibilityChecker from './index';
import { currentBrowser, getApplicapleBrowsers } from 'utils/browsers';
import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';
import {
  isCheckingCompatiblity,
  isBrowserCompatible,
  getMissingFeaturesForUserAgent,
} from 'store/reducers/env/compat';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = (state: StoreState, { userAgent }: OwnProps) => {
  const isCompatible = isBrowserCompatible(state)(userAgent);
  const isChecking = isCheckingCompatiblity(state);
  return {
    currentBrowser,
    isChecking,
    shouldUpgradeCurrentBrowser: !isCompatible,
    missingFeatures: getMissingFeaturesForUserAgent(state)(userAgent),
    open: isChecking || !isCompatible,
    isNerdMode: false,
    recommendedBrowsers: getApplicapleBrowsers(true),
  };
};

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> = (_) => (
  {
    onDialogClosed: noop, // @TODO: Ignore compatiblity check? Is this a good idea?
  }
);

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(CompatibilityChecker);


export default connected;
