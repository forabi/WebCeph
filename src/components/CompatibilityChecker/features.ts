interface FeatureDetails {
  name: string;
  whyRequired?: string;
};

// @TODO: handle all features
export default {
  canvas: {
    name: 'Canvas',
    whyRequired: (
      'This feature is required to display lines and angles ' + 
      'while tracing a cephalometric image'
    ),
  },
  contextmenu: {
    name: 'Context Menu',
    whyRequired: (
      'This feature is required to display a menu when you right-click ' +
      'on the cephalometric tracing canvas'
    ),
  },
  serviceworker: {
    name: 'Service Worker',
    whyRequired: (
      'This feature is required to ensure that this application can work even ' +
      'without an internet connection'
    ),
  },
  indexeddb: {
    name: 'IndexedDb',
    whyRequired: (
      'This feature is required to store application data'
    ),
  },
  indexeddbblob: {
    name: 'IndexedDb',
    whyRequired: (
      'This feature is required to store binary data in application storage'
    ),
  },
  webworkers: {
    name: 'Web Workers',
    whyRequired: (
      'This feature is required to perform computationally expensive' +
      'image editing operations without degrading the performance ' +
      'of the web application'
    ),
  },
  flexbox: {
    name: 'Flexbox',
    whyRequired: (
      'This feature is required to display the various '+
      'application panels and toolbars'
    ),
  },
  bloburls: {
    name: 'Blob URLs',
    whyRequired: (
      'This feature is required to load images from the hard disk'
    ),
  },
  es6number: {
    name: 'ES6 Number',
  },
  oninput: {
    name: 'On Input',
  },
  sharedworkers: {
    name: 'Shared Workers',
  },
  transferables: {
    name: 'Transfarables',
  },
  datauri: {
    name: 'Data URI',
    whyRequired: (
      'This feature is required to load images from the hard disk'
    ),
  },
  inlinesvg: {
    name: 'Inline SVG',
  },
  filereader: {
    name: 'FileReader API',
  },
  cssanimations: {
    name: 'CSS Animations',
  },
  intl: {
    name: 'Internationalization API',
    whyRequired: (
      'This feature is required to display the application menus and dialogs ' +
      'in your language'
    ),
  },
  json: {
    name: 'JSON',
  },
  eventlistener: {
    name: 'EventListener',
  },

} as { [id: string]: FeatureDetails };