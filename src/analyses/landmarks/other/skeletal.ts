import {
  angularSum,
  defaultInterpetLandmark,
} from 'analyses/helpers';

import { NSAr, SArGo, ArGoMe, FMIA } from 'analyses/landmarks/angles/skeletal';
import { L1Axis } from 'analyses/landmarks/lines/skeletal';

import {
  calculateAngle,
  getVectorPoints,
  createVectorFromPoints,
  rotatePointAroundOrigin,
  degreesToRadians,
  radiansToDegrees,
} from 'utils/math';

export const bjorkSum: CephAngularSum = {
  ...angularSum([NSAr, SArGo, ArGoMe], 'Björk\'s sum', 'Björk'),
  interpret: defaultInterpetLandmark(
    'growthPattern',
    ['horizontal', 'normal', 'vertical'],
  ),
};

export const cephCorrection: CephLandmark = {
  name: 'Cephalometric correction',
  symbol: 'ceph-correction',
  type: 'distance',
  components: [FMIA, L1Axis],
  imageTypes: ['ceph_lateral'],
  unit: 'mm',
  map(geoFMIA: GeoAngle, axis: GeoVector) {
    const actualAngle = calculateAngle(geoFMIA);
    const rotation = actualAngle - degreesToRadians(65);
    const [apex, edge] = getVectorPoints(axis);
    const newEdge = rotatePointAroundOrigin(apex, edge, rotation);
    return createVectorFromPoints(apex, newEdge);
  },
  calculate: () => (geoFMIA: GeoAngle) => () => {
    const actualAngle = calculateAngle(geoFMIA);
    const rotation = actualAngle - degreesToRadians(65);
    // @TODO: measure on the occlusion plane
    return 0.8 * radiansToDegrees(rotation);
  },
};
