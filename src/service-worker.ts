// tslint:disable no-reference
/// <reference path="./service-worker.d.ts" />
import toolbox from 'sw-toolbox/sw-toolbox.js';

toolbox.options = __DEBUG__;

type ServiceWorkerOptions = {
  assets: ReadonlyArray<string>
};

declare const serviceWorkerOption: ServiceWorkerOptions;

const { assets } = serviceWorkerOption;

const assetsToCache = [
  ...assets,
  './',
];

toolbox.precache(assetsToCache);

toolbox.router.get('/*', toolbox.cacheFirst);
