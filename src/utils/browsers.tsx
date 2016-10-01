import React from 'react';
import bowser from 'bowser';

const ChromeIcon = require('./icons/chrome.svg').default;
const FirefoxIcon = require('./icons/firefox.svg').default;
const EdgeIcon = require('./icons/edge.svg').default;
const OperaIcon = require('./icons/opera.svg').default;
const SafariIcon = require('./icons/safari-ios.svg').default;

interface BrowserDetails {
  name: string;
  downloadUrl: string;
  icon: JSX.Element;
  isApplicable?(): boolean;
}

const _current = bowser;

export const details = {
  Chrome: {
    name: 'Chrome',
    downloadUrl: 'https://google.com/chrome',
    icon: <ChromeIcon />,
  },
  Firefox: {
    name: 'Firefox',
    downloadUrl: 'https://getfirefox.com/',
    icon: <FirefoxIcon />,
  },
  Opera: {
    name: 'Opera',
    downloadUrl: 'https://opera.com/',
    icon: <OperaIcon />,
  },
  'Microsoft Edge': {
    name: 'Edge',
    downloadUrl: 'https://www.microsoft.com/windows/microsoft-edge',
    icon: <EdgeIcon />,
    isApplicable() {
      return _current.windows && _current.osversion === '10';
    }
  },
  Safari: {
    name: 'Safari',
    downloadUrl: 'https://www.apple.com/safari/',
    icon: <SafariIcon />,
    isApplicable() {
      return _current.mac;
    }
  },
} as { [id: string]: BrowserDetails };


export const currentBrowser: Browser = {
  id: _current.name as BrowserId,
  name: details[_current.name].name,
  downloadUrl: details[_current.name].downloadUrl,
  version: _current.version,
}

export default details;