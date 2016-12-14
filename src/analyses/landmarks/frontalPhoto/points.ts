import { reuseLandmarkForImageType } from 'analyses/helpers';
import { G, Sn, softMe } from 'analyses/landmarks/points/soft';

import {
  createVectorFromPoints,
  composeGeoObject,
  createHorizontalLine,
} from 'utils/math';

export const frontalG: CephLandmark = reuseLandmarkForImageType('photo_frontal')(G);

export const frontalSn: CephLandmark = reuseLandmarkForImageType('photo_frontal')(Sn);

export const frontalSoftMe: CephLandmark = reuseLandmarkForImageType('photo_frontal')(softMe);

export const upperFaceHeight: CephLandmark = {
  symbol: 'upperFaceHeight',
  name: 'Upper face height',
  unit: 'mm',
  components: [frontalG, frontalSn],
  imageType: 'photo_frontal',
  type: 'distance',
  map(G: GeoPoint, Sn: GeoPoint) {
    return createVectorFromPoints(G, Sn);
  },
  calculate: () => (G: GeoPoint, Sn: GeoPoint) => () => {
    return G.y - Sn.y;
  },
};

export const lowerFaceHeight: CephLandmark = {
  symbol: 'lowerFaceHeight',
  name: 'Lower face height',
  unit: 'mm',
  components: [frontalSn, softMe],
  imageType: 'photo_frontal',
  type: 'distance',
  map(Sn: GeoPoint, softMe: GeoPoint) {
    return createVectorFromPoints(Sn, softMe);
  },
  calculate: () => (Sn: GeoPoint, softMe: GeoPoint) => () => {
    return Sn.y - softMe.y;
  },
};

export const verticalFaceProprtions: CephLandmark = {
  symbol: 'verticalFaceProprtions',
  name: 'Vertical Face Proportions',
  components: [upperFaceHeight, lowerFaceHeight, frontalG, frontalSn, frontalSoftMe],
  imageType: 'photo_frontal',
  type: 'ratio',
  map(_, __, G: GeoPoint, Sn: GeoPoint, softMe: GeoPoint) {
    return composeGeoObject(
      createHorizontalLine(G, 0),
      createHorizontalLine(Sn, 0),
      createHorizontalLine(softMe, 0),
    );
  },
  calculate: (upper: number, lower: number) => () => () => {
    return upper / lower;
  },
};
