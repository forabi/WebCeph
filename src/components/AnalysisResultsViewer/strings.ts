import {
  SkeletalPattern,
  SkeletalProfile,
  Maxilla,
  Mandible, MandibularRotation,
  GrowthPattern,
  SkeletalBite,
  LowerIncisorInclination,
  UpperIncisorInclination,
  AnalysisResultSeverity,
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
  [SkeletalBite.closed]: 'Closed'
};

/** A map of the seveirty of skeletal problems to human-readable phrases */
const severityMap = {
  [AnalysisResultSeverity.LOW]: 'Slight',
  [AnalysisResultSeverity.MEDIUM]: 'Medium',
  [AnalysisResultSeverity.HIGH]: 'Severe',
};

export function mapSeverityToString(value: number) {
  return severityMap[value] || null;
};

export function mapTypeToIndication(value: number) {
  return typeMap[value] || null;
};
