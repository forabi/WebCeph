const N = 'Most anterior point on frontonasal suture';

export const descriptions: { [id: string]: string } = {
  N,
  Na: N,
  Pog: 'Most anterior point of mandibular symphysis',
  Gn: (
    'Point located perpendicular on madibular symphysis ' +
    'midway between pogonion and menton'
  ),
  S: 'Midpoint of sella turcica',
  Or: 'Most inferior point on margin of orbit',
  Po: 'Most superior point of outline of external auditory meatus',
  A: 'Most concave point of anterior maxilla',
  B: 'Most concave point on mandibular symphysis',
};

export const getDescriptionForLandmark = (landmark: CephLandmark) => {
  return descriptions[landmark.symbol] || landmark.description || null;
};

export const getCommandForStep = (landmark: CephLandmark): string => {
  const displayName = landmark.name || landmark.symbol;
  if (landmark.type === 'point') {
    return `Set point ${displayName}`;
  } else if (landmark.type === 'line') {
    return `Draw line ${displayName}`;
  } else if (landmark.type === 'angle') {
    return `Calculate ${landmark.name || `angle ${landmark.symbol}`}`;
  } else if (landmark.type === 'distance') {
    return (
      `Measure distance between points ` +
      `${getCommandForStep(landmark.components[0])} and ` +
      `${getCommandForStep(landmark.components[1])}`
    );
  } else if (landmark.type === 'sum') {
    return `Calculate ${displayName}`;
  } else if (landmark.type === 'ratio') {
    return `Calculate ratio ${displayName}`;
  }
  return displayName;
};
