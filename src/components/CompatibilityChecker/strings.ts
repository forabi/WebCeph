import featureDetails from 'utils/features';

export const getDisplayNameForBrowser = (id: string) => {
  return id || 'Unknown';
};

export const getFeatureName = ({ id }: BrowserFeature) => {
  if (id && featureDetails[id]) {
    return featureDetails[id].name;
  }
  return id || 'Unknown feature';
};

export const getWhyFeatureIsRequired = ({ id }: BrowserFeature) => {
  if (id && featureDetails[id]) {
    return featureDetails[id].whyRequired;
  }
  return undefined;
};
