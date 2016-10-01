import filter from 'lodash/filter';
import memoize from 'lodash/memoize';
import browserDetails, { currentBrowser } from '../../utils/browsers';

export const getCurrentBrowser = () => currentBrowser;

const recommendedBrowsers: BrowserRecommendation[] = [
  {
    id: 'Chrome',
    name: 'Chrome',
  },
  {
    id: 'Firefox',
    name: 'Firefox',
  },
  {
    id: 'Microsoft Edge',
    name: 'Edge',
  },
  {
    id: 'Opera',
    name: 'Opera',
  },
  {
    id: 'Safari',
    name: 'Safari',
  },
];

export const getRecommendedBrowsers = memoize(() => filter(recommendedBrowsers, b => {
  if (browserDetails[b.id].isApplicable) {
    return browserDetails[b.id].isApplicable();
  }
  return true;
}));