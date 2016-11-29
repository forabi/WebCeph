import * as React from 'react';

interface AngleProps {
  children: [GeometricalVector, GeometricalVector];
}

import some from 'lodash/some';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';

const isPointInVector = (
  point: GeometricalPoint,
  { x1, y1, x2, y2 }: GeometricalVector,
) => isEqual(point, { x1, y1 }) || isEqual(point, { x2, y2 });

const haveCommonPoint = (
  { x1, x2, y1, y2 }: GeometricalVector,
  vector2: GeometricalVector,
) => some(
  [{ x: x1, y: y1 }, { x: x2, y: y2 }],
  (point) => isPointInVector(point, vector2),
);

const getEquationForLine = ({ x1, x2, y1, y2 }: GeometricalVector) => {
  const slope = (y2 - y1) / (x2 - x1);
  return (x: number) => slope * (x - x1) + y1;
}

const createParallelVector = (
  { x1, y1, x2, y2 }: GeometricalVector,
  point: GeometricalPoint,
) => {
  const slope = (y2 - y1) / (x2 - x1);
  const getY = (x: number) => slope * (x - point.x) + point.y;
  return {
    x1: point.x, y1: getY(point.x),
    x2, y2,
  };
};

const meetWithinRect = (
  vector1: GeometricalVector,
  vector2: GeometricalVector,
  rect: { top: number, left: number, width: number, height: number },
) => {
  const line1Eq = getEquationForLine(vector1);
  const line2Eq = getEquationForLine(vector2);
  
}

const Angle = (props: AngleProps) => {
  const { children: vectors } = props;
  const [vector1, vector2] = vectors;
  if (haveCommonPoint(vector1, vector2)) {
    return (
      <g>
      {
        map(vectors, (vector, i) => <line key={i} {...vector} />)
      }
      </g>
    );
  } else if (meetWithinRect(vector1, vector2, rect)) {
    // @TODO: extend
  } else {
    // @TODO: create parallel
    const parallelToVector2 = createParallelVector(vector2, { x: vector1.x1, y: vector1.y1 });
    return (
      <Angle>
        <Vector {...vector1} style={realStyle} />
        <Vector {...parallelToVector2} style={virtualStyle} />
      </Angle>
    )
  }
};