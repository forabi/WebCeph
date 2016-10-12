import bowser from 'bowser';

const ChromeIcon: string = require('url!./icons/chrome.svg');
const FirefoxIcon: string = require('url!./icons/firefox.svg');
const EdgeIcon: string = require('url!./icons/edge.svg');
const OperaIcon: string = require('url!./icons/opera.svg');
const SafariIcon: string = require('url!./icons/safari-ios.svg');

interface BrowserDetails {
  name: string;
  downloadUrl: string;
  icon: string;
  isApplicable?(): boolean;
}

const _current = bowser;

export const details = {
  Chrome: {
    name: 'Chrome',
    downloadUrl: 'https://google.com/chrome',
    icon: ChromeIcon,
  },
  Firefox: {
    name: 'Firefox',
    downloadUrl: 'https://getfirefox.com/',
    icon: FirefoxIcon,
  },
  Opera: {
    name: 'Opera',
    downloadUrl: 'https://opera.com/',
    icon: OperaIcon,
  },
  'Microsoft Edge': {
    name: 'Edge',
    downloadUrl: 'https://www.microsoft.com/windows/microsoft-edge',
    icon: EdgeIcon,
    isApplicable() {
      return _current.windows && _current.osversion === '10';
    }
  },
  Safari: {
    name: 'Safari',
    downloadUrl: 'https://www.apple.com/safari/',
    icon: SafariIcon,
    isApplicable() {
      return _current.mac;
    }
  },
} as { [id: string]: BrowserDetails };


export const currentBrowser: Browser = {
  id: _current.name as BrowserId,
  name: details[_current.name] ? details[_current.name].name : 'Unknown',
  downloadUrl: details[_current.name] ? details[_current.name].downloadUrl : '',
  version: _current.version,
}

export default details;