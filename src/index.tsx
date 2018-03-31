import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from 'components/App/App';
import { IntlProvider, addLocaleData, LocaleData } from 'react-intl';

const rootEl = document.getElementById('container');

const locale = 'ar';

type Module<T> = {
  default: T;
};

Promise.all([
  import(`./locales/${locale}.json`),
  import(`react-intl/locale-data/${locale}`),
]).then(
  ([{ default: messages }, { default: localeData }]: [
    Module<Record<string, string>>,
    Module<LocaleData>
  ]) => {
    addLocaleData(localeData);
    document.dir = messages.dir;

    ReactDOM.render(
      <IntlProvider locale={locale} messages={messages}>
        <App />
      </IntlProvider>,
      rootEl,
    );
  },
);
