import { distance, defaultInterpetLandmark } from 'analyses/helpers';

import {
  A, L1_APEX
} from 'analyses/landmarks/points/skeletal';

import {
  NPog, dentalPlane,
} from 'analyses/landmarks/lines/skeletal';

export const convexityAtPointA: CephDistance = {
  ...distance(A, NPog),
  interpret: defaultInterpetLandmark(
    'skeletalPattern',
    ['class3', 'class1', 'class2'],
  ),
};

export const mandibularIncisorToDentalPlane: CephDistance = {
  ...distance(L1_APEX, dentalPlane),
  interpret: defaultInterpetLandmark(
    'lowerIncisorInclination',
    ['lingual', 'normal', 'buccal'],
  )
}