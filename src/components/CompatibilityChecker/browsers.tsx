import React from 'react';
import bowser from 'bowser';

const ChromeIcon = require('./icons/chrome.svg').default;
const FirefoxIcon = require('./icons/firefox.svg').default;
const EdgeIcon = require('./icons/edge.svg').default;
const OperaIcon = require('./icons/opera.svg').default;
const SafariIcon = require('./icons/safari-ios.svg').default;

export type BrowserId = 'Chrome' | 'Firefox' | 'Opera' | 'Microsoft Edge' | 'Safari';
export type OsId = 'mac' | 'windows' | 'linux' | 'chromeos' | 'ios' | 'android';

interface BrowserDetails {
  name: string;
  downloadUrl: string;
  icon: JSX.Element;
  isApplicable?(): boolean;
}

export const currentBrowser = bowser;

export default {
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
      return currentBrowser.windows;
    }
  },
  Safari: {
    name: 'Safari',
    downloadUrl: 'https://www.apple.com/safari/',
    icon: <SafariIcon />,
    isApplicable() {
      return currentBrowser.mac;
    }
  },
} as { [id: string]: BrowserDetails };
