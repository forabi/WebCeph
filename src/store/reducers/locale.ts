import { handleActions } from 'utils/store';
import { createSelector } from 'reselect';
import { negotiateLanguageOrLocale } from 'utils/locale';
import { supportedLocales, bundledLocales, bundleLocaleData } from 'utils/config';
import zipObject from 'lodash/zipObject';
import filter from 'lodash/filter';
import map from 'lodash/map';

const KEY_SUPPORTED_LOCALES: StoreKey = 'app.locale.supportedLocales';
const KEY_LOCALE_DATA: StoreKey = 'app.locale.data';
const KEY_LOCALE_FETCH_STATUS: StoreKey = 'app.locale.fetchStatus';
const KEY_REQUESTED_LOCALES: StoreKey = 'env.locale.requestedLocales';
const KEY_USER_PREFERRED_LOCALE: StoreKey = 'user.preferences.preferredLocale';

const bundledLocalesStatus = zipObject(
  bundledLocales,
  map(bundledLocales, (): FetchStatus => ({ error: null, isLoading: false })),
);

const reducers: Partial<ReducerMap> = {
  [KEY_SUPPORTED_LOCALES]: () => supportedLocales,
  [KEY_REQUESTED_LOCALES]: handleActions<typeof KEY_REQUESTED_LOCALES>({
    ENV_LOCALES_CHANGED: (_, { payload }) => payload,
  }, []),
  [KEY_LOCALE_DATA]: handleActions<typeof KEY_LOCALE_DATA>({
    FETCH_LOCALE_SUCCEEDED: (state, { payload: { locale, messages } }) => {
      return {
        ...state,
        [locale]: messages,
      };
    },
  }, bundleLocaleData),
  [KEY_USER_PREFERRED_LOCALE]: handleActions<typeof KEY_USER_PREFERRED_LOCALE>({
    SET_USER_PREFERRED_LOCALE: (_, { payload }) => {
      return payload;
    },
    UNSET_USER_PREFERRED_LOCALE: (_, __) => null,
  }, null),
  [KEY_LOCALE_FETCH_STATUS]: handleActions<typeof KEY_LOCALE_FETCH_STATUS>({
    FETCH_LOCALE_STARTED: (state, { payload: locale }) => {
      return {
        ...state,
        [locale]: {
          error: null,
          isLoading: true,
        },
      };
    },
    FETCH_LOCALE_SUCCEEDED: (state, { payload: { locale } }) => {
      return {
        ...state,
        [locale]: {
          error: null,
          isLoading: false,
        },
      };
    },
    FETCH_LOCALE_FAILED: (state, { payload: { locale, error } }) => {
      return {
        ...state,
        [locale]: {
          error,
          isLoading: false,
        },
      };
    },
  }, bundledLocalesStatus),
};

export default reducers;

export const getSupportedLocales = (state: StoreState) => state[KEY_SUPPORTED_LOCALES];
export const getEnvLocales = (state: StoreState) => state[KEY_REQUESTED_LOCALES];
export const getUserPreferredLocale = (state: StoreState) => state[KEY_USER_PREFERRED_LOCALE];
export const getFetchStatus = (state: StoreState) => state[KEY_LOCALE_FETCH_STATUS];
export const getLocaleData = (state: StoreState) => state[KEY_LOCALE_DATA];

export const hasLocaleFetchingFailed = createSelector(
  getFetchStatus,
  (status) => (locale: string) => (
    status[locale] !== undefined &&
    status[locale].error !== null
  ),
);

export const isLocaleFetching = createSelector(
  getFetchStatus,
  (status) => (locale: string) => (
    status[locale] !== undefined &&
    status[locale].error === null &&
    status[locale].isLoading === true
  ),
);

export const isLocaleFetched = createSelector(
  getFetchStatus,
  (status) => (locale: string) => (
    status[locale] !== undefined &&
    status[locale].error === null &&
    status[locale].isLoading === false
  ),
);

export const getSupportedFetchedLocales = createSelector(
  getSupportedLocales,
  isLocaleFetched,
  (supported, isFetched) => {
    return filter(supported, isFetched);
  },
);

export const getAllPreferredLocales = createSelector(
  getEnvLocales,
  getUserPreferredLocale,
  (envLocales, preferred) => {
    if (preferred === null) {
      return envLocales;
    }
    return [preferred, ...envLocales];
  },
);

export const getNegotiatedLocale = createSelector(
  getSupportedLocales,
  getAllPreferredLocales,
  (supported, preferred) => {
    return negotiateLanguageOrLocale(
      supported,
      preferred,
      true,
      true,
    ) as string;
  },
);

export const getLocaleToFetch = createSelector(
  isLocaleFetched,
  isLocaleFetching,
  getNegotiatedLocale,
  (isFetched, isFetching, locale) => {
    if (!isFetched(locale) && !isFetching(locale)) {
      return locale;
    }
    return undefined;
  },
);

export const getFirstReadyNegotiatedLocale = createSelector(
  getSupportedFetchedLocales,
  getAllPreferredLocales,
  (supported, preferred) => {
    return negotiateLanguageOrLocale(
      supported,
      preferred,
      true,
      true,
    ) as string;
  },
);

export const getActiveLocale = getFirstReadyNegotiatedLocale;

export const isNegotiatedLocaleFetched = createSelector(
  isLocaleFetched,
  getNegotiatedLocale,
  (isFetched, locale) => isFetched(locale),
);

export const getNegotiatedLocaleFetchError = createSelector(
  getFetchStatus,
  getNegotiatedLocale,
  (getStatus, locale) => getStatus[locale].error,
);

export const getLocaleDataById = createSelector(
  getLocaleData,
  (data) => (id: string) => data[id],
);

export const getActiveLocaleData = createSelector(
  getLocaleDataById,
  getFirstReadyNegotiatedLocale,
  (getData, locale) => getData(locale),
);
