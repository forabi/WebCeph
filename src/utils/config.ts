const redoType: ActionType = 'REDO_REQUESTED';
const undoType: ActionType = 'UNDO_REQUESTED';

const undoableConfig = {
  undoType,
  redoType,
  limit: 100,
};

export const DEMO_IMAGE_URL =
  'https://upload.wikimedia.org/wikipedia/commons/6/66/Cephalometric_radiograph.JPG';

export { undoableConfig };

export const supportedLocales = ['en-US', 'ar-SY'];

export const bundledLocales = ['en-US'];

import zipObject from 'lodash/zipObject';
import map from 'lodash/map';

export const bundleLocaleData = zipObject(
  bundledLocales,
  map(bundledLocales, (locale) => {
    return require(`json-loader!locale/${locale}.json`) as Locale;
  }),
);

