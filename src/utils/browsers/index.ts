import bowser from 'bowser';
import filter from 'lodash/filter';
import memoize from 'lodash/memoize';
import keyBy from 'lodash/keyBy';

const ChromeIcon: string = require('url-lodaer!./icons/chrome.svg');
const FirefoxIcon: string = require('url-loader!./icons/firefox.svg');
const EdgeIcon: string = require('url-loader!./icons/edge.svg');
const OperaIcon: string = require('url-loader!./icons/opera.svg');
const SafariIcon: string = require('url-loader!./icons/safari-ios.svg');

interface BrowserDetails {
  id: string;
  downloadUrl: string;
  icon: string;
  isApplicable?: boolean | (() => boolean);
}

const _current = bowser;

export const recommendedBrowsers: BrowserDetails[] = [
  {
    id: 'Chrome',
    downloadUrl: 'https://google.com/chrome',
    icon: ChromeIcon,
  },
  {
    id: 'Firefox',
    downloadUrl: 'https://getfirefox.com/',
    icon: FirefoxIcon,
  },
  {
    id: 'Opera',
    downloadUrl: 'https://opera.com/',
    icon: OperaIcon,
  },
  {
    id: 'Microsoft Edge',
    downloadUrl: 'https://www.microsoft.com/windows/microsoft-edge',
    icon: EdgeIcon,
    isApplicable() {
      return _current.windows && _current.osversion === '10';
    },
  },
  {
    id: 'Safari',
    downloadUrl: 'https://www.apple.com/safari/',
    icon: SafariIcon,
    isApplicable() {
      return _current.mac;
    },
  },
];

export const browsersById = keyBy(recommendedBrowsers, b => b.id);

export const currentBrowser: Browser = {
  id: _current.name as BrowserId,
  downloadUrl: browsersById[_current.name] ? browsersById[_current.name].downloadUrl : '',
  version: _current.version,
};

export const getApplicapleBrowsers = memoize(
  (excludeCurrentBrowser: boolean = true) => filter(browsersById, (browser, id) => {
    if (excludeCurrentBrowser && id === currentBrowser.id) return false;
    if (typeof browser.isApplicable === 'function') {
      return browser.isApplicable();
    } else if (typeof browser.isApplicable === 'boolean') {
      return browser.isApplicable;
    }
    return false;
  }),
);

export default recommendedBrowsers;
