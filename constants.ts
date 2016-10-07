/** A result of interpreting the evaluated components of a cephalometric analysis */
export enum AnalysisResultType {
  // Skeletal pattern
  CLASS_I_SKELETAL_PATTERN,
  CLASS_II_SKELETAL_PATTERN,
  CLASS_III_SKELETAL_PATTERN,

  // Maxilla
  PROGNATHIC_MAXILLA,
  RETROGNATHIC_MAXILLA,
  /** Indicates the maxilla is neither retrognathic nor prognathic */
  NORMAL_MAXILLA,

  // Mandible
  PROGNATHIC_MANDIBLE,
  RETROGNATHIC_MANDIBLE,
  /** Indicates the mandible is neither retrognathic nor prognathic */
  NORMAL_MANDIBLE,

  // Skeletal profile
  NORMAL_SKELETAL_PROFILE,
  CONCAVE_SKELETAL_PROFILE,
  CONVEX_SKELETAL_PROFILE,
}

export enum AnalysisResultSeverity {
  NONE = 0,
  UNKNOWN = NONE,
  LOW = 1,
  SLIGHT = LOW,
  MEDIUM = 2,
  HIGH = 3,
  SEVERE = HIGH,
}
