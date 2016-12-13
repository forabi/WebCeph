import { distance, defaultInterpetLandmark } from 'analyses/helpers';

import {
  Li, Ls,
} from 'analyses/landmarks/points/soft';

import {
  ELine,
} from 'analyses/landmarks/lines/soft';

export const lowerLipToELine: CephDistance = {
  ...distance(Li, ELine),
  interpret: defaultInterpetLandmark(
    'lowerLipProminence',
    ['resessive', 'normal', 'prominent'],
  ),
};

export const upperLipToELine: CephDistance = {
  ...distance(Ls, ELine),
  interpret: defaultInterpetLandmark(
    'upperLipProminence',
    ['resessive', 'normal', 'prominent'],
  )
}