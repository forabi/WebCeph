import first from 'lodash/first';
import find from 'lodash/find';

const localeRegExp = /([a-z]{2,})(?:\-([A-Z]{2,}))?/;

/** Return the primary language part of an IETF language tag
 * @example en-US => en
 */
export function getPrimaryLang(locale: string) {
  const matches = locale.match(localeRegExp);
  return (matches && matches[1]) ? matches[1] : undefined;
}

/** Return the first subtag of an IETF language tag
 * @example en-US => US
 */
export function getSubtag(locale: string) {
  const matches = locale.match(localeRegExp);
  return (matches && matches[2]) ? matches[2] : undefined;
}

/**
 * Finds the first supported locale preferred by the user
 * given an array of locales supported by an app, and an array of locales
 * preferred by the user in order of preference.
 * If the third parameter is set to true and an exact match was not found,
 * falls back to negotiating for primary language.
 * If the fourth parameter is set to true and none of the supported languages
 * is preferred, falls back to the first supported language.
 * Otherwise returns `undefined`.
 */
export function negotiateLanguageOrLocale(
  supported: string[] = ['en-US'],
  preferred: string[] ,
  tryPrimaryLanguage = true,
  fallbackToFirstSupported = true,
): string | undefined {
  let locale: (string | undefined);
  for (let i = 0; i < preferred.length && locale === undefined; i++) {
    locale = find(supported, s => s === preferred[i]);
    if (locale === undefined && tryPrimaryLanguage === true) {
      locale = find(supported, s => getPrimaryLang(s) === getPrimaryLang(preferred[i]));
    }
  }
  if (locale === undefined && fallbackToFirstSupported === true) {
    locale = first(supported);
  }
  return locale;
};
