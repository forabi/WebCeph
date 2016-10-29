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
}


export const getDescriptionForStep = (landmark: CephaloLandmark) => {
  return descriptions[landmark.symbol] || landmark.description || null;
};

export const getTitleForStep = (landmark: CephaloLandmark) => {
  if (landmark.type === 'point') {
    return `Set point ${landmark.symbol}${ landmark.name ? ` (${landmark.name})` : '' }`;
  } else if (landmark.type === 'line') {
    return `Draw line ${landmark.symbol}${ landmark.name ? ` (${landmark.name})` : '' }`;
  } else if (landmark.type === 'angle') {
    return `Calculate angle ${landmark.symbol}${ landmark.name ? ` (${landmark.name})` : '' }`;
  } else if (landmark.type === 'distance') {
    return `Measure distance between points ${landmark.components[0].symbol} and ${landmark.components[1].symbol}`
  } else if (landmark.type === 'sum') {
    return `Calculate ${landmark.name || landmark.symbol || landmark.components.map(c => c.symbol).join(' + ')}`
  }
  __DEBUG__ && console.warn(
    `Could not get title for step`,
    landmark,
  );
  return undefined;
};
