import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';

import Settings from './index';
import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';

import {
  setUserPreferredLocale,
  unsetUserPreferredLocale,
} from 'actions/preferences';

import {
  getUserPreferredLocale,
} from 'store/reducers/locale';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: StoreState) => {
    return {
      currentUserPreferredLocale: getUserPreferredLocale(state),
    };
  };

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (dispatch) => (
    {
      onLocaleChange: (locale) => dispatch(setUserPreferredLocale(locale)),
      onLocaleUnset: () => dispatch(unsetUserPreferredLocale(void 0)),
    }
  );

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(Settings);

export default connected;
