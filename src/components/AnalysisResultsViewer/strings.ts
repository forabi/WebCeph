import findKey from 'lodash/findKey';

import {
  SkeletalPattern,
  SkeletalProfile,
  Maxilla,
  Mandible, MandibularRotation,
  GrowthPattern,
  SkeletalBite,
  LowerIncisorInclination,
  UpperIncisorInclination,
  ProblemSeverity,
  isSkeletalBite,
  isSkeletalPattern,
  isLowerIncisorInclination,
  isUpperIncisorInclination,
  isMandible,
  isMandiblularRotation,
  isMaxilla,
  isSkeletalProfile,
  isGrowthPattern,
} from 'analyses/helpers';

/** A map of interpretation results to human-readable phrases */
const typeMap = {
  [SkeletalPattern.class1]: 'Class I',
  [SkeletalPattern.class2]: 'Class II',
  [SkeletalPattern.class3]: 'Class III',
  [SkeletalProfile.concave]: 'Concave',
  [SkeletalProfile.convex]: 'Convex',
  [SkeletalProfile.normal]: 'Normal',
  [Maxilla.normal]: 'Normal',
  [Maxilla.prognathic]: 'Prognathic',
  [Maxilla.retrognathic]: 'Retrognathic',
  [Mandible.normal]: 'Normal',
  [Mandible.prognathic]: 'Prognathic',
  [Mandible.retrognathic]: 'Retrognathic',
  [MandibularRotation.clockwise]: 'Clockwise',
  [MandibularRotation.counterClockwise]: 'Counter-clockwise',
  [MandibularRotation.normal]: 'Normal',
  [GrowthPattern.clockwise]: 'Vertical',
  [GrowthPattern.counterClockwise]: 'Horizontal',
  [GrowthPattern.normal]: 'Normal',
  [LowerIncisorInclination.normal]: 'Normal',
  [LowerIncisorInclination.labial]: 'Labial',
  [LowerIncisorInclination.lingual]: 'Lingual',
  [UpperIncisorInclination.normal]: 'Normal',
  [UpperIncisorInclination.labial]: 'Labial',
  [UpperIncisorInclination.palatal]: 'Palatal',
  [SkeletalBite.normal]: 'Normal',
  [SkeletalBite.open]: 'Open',
  [SkeletalBite.closed]: 'Closed',
};

/** A map of the seveirty of skeletal problems to human-readable phrases */
const severityMap = {
  [ProblemSeverity.LOW]: 'Slight',
  [ProblemSeverity.MEDIUM]: 'Medium',
  [ProblemSeverity.HIGH]: 'Severe',
};

export function mapSeverityToString(value?: number) {
  return value !== undefined ? severityMap[value] : null;
};

export function mapIndicationToString(value?: number) {
  return value !== undefined ? typeMap[value] : null;
};

type CategoryTest = (value: number | string) => boolean;

const categoryMap: { [catergory: string]: CategoryTest } = {
  'Skeletal Bite': isSkeletalBite,
  'Skeletal Pattern': isSkeletalPattern,
  'Mandibular Rotation': isMandiblularRotation,
  Mandible: isMandible,
  Maxilla: isMaxilla,
  'Lower Incisor Inclination': isLowerIncisorInclination,
  'Upper Incisor Inclination': isUpperIncisorInclination,
  'Growth Pattern': isGrowthPattern,
  'Skeletal Profile': isSkeletalProfile,
};

export function mapCategoryToString(value?: number) {
  if (value !== undefined) {
    return findKey(categoryMap, (test: CategoryTest) => test(value));
  }
  return null;
};
