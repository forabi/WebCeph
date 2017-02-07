import { Store, Dispatch, Middleware } from 'redux';

import { getLocaleToFetch } from 'store/reducers/locale';

import { isActionOfType } from 'utils/store';

import { getPrimaryLang } from 'utils/locale';

import { addLocaleData } from 'react-intl';

import {
  fetchLocaleStarted,
  fetchLocaleFailed,
  fetchLocaleSucceeded,
} from 'actions/env';

import some from 'lodash/some';

const observedActions: ActionType[] = [
  'ENV_LOCALES_CHANGED',
  'SET_USER_PREFERRED_LOCALE',
];

declare const require: __WebpackModuleApi.RequireFunction;

const requireLang = require.context(`react-intl/locale-data`, false, /\.js$/);

const addReactIntlData = (locale: string) => {
  const primaryLang = getPrimaryLang(locale);
  return new Promise((resolve, reject) => {
    require.ensure([], () => {
      try {
        const data = requireLang(`./${primaryLang}.js`) as ReactIntl.Locale;
        console.log('hey!', data);
        addLocaleData(data);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
};

const middleware: Middleware = ({ getState }: Store<StoreState>) =>
  (next: Dispatch<GenericAction>) => async (action: GenericAction) => {
    next(action);
    if (some(observedActions, (type) => isActionOfType(action, type))) {
      const state = getState();
      const locale = getLocaleToFetch(state);
      if (locale !== undefined) {
        const url = require(`url-loader!locale/${locale}.json`) as string;
        next(fetchLocaleStarted(locale));
        try {
          const [ messages ] = await Promise.all([
            (await fetch(url)).json() as Promise<Locale>,
            addReactIntlData(locale),
          ]);
          next(fetchLocaleSucceeded({ locale, messages }));
        } catch (error) {
          next(fetchLocaleFailed({ locale, error }));
        }
      }
    }
  };

export default middleware;
