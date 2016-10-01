interface FeatureDetails {
  name: string;
  whyRequired: string;
};

export default {
  contextmenu: {
    name: 'Context Menu',
    whyRequired: (
      'This feature is required to display a menu when you right-click ' +
      'on the cephalometric tracing canvas'
    ),
  }
} as { [id: string]: FeatureDetails };