import * as React from 'react';

import clamp from 'lodash/clamp';

interface Rect {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

interface AngleProps {
  boundingRect: Rect;
  vectors: [GeometricalVector, GeometricalVector];
}

const isPointWithinRect = ({ x, y }: GeometricalPoint, { top, left, bottom, right }: Rect) => {
  return (
    clamp(x, left, right) === x &&
    clamp(y, top, bottom) === y
  );
};

const getSlope = ({ x1, y1, x2, y2}: GeometricalVector) => (y1 - y2) / (x1 - x2);

const getYInterceptEquation = (vector: GeometricalVector) => {
  const { x1, y1 } = vector;
  return (x: number) => getSlope(vector) * (x - x1) + y1;
};

const isPointCloserTo = (
  _: GeometricalPoint,
  __: GeometricalVector,
  ___: GeometricalVector,
) => {
  return false;
};

const isPointInLine = (
  { x,  y }: GeometricalPoint,
  vector: GeometricalVector,
) => {
  const getY = getYInterceptEquation(vector);
  return getY(x) === y;
};

const isPointInSegment = (
  point: GeometricalPoint,
  vector: GeometricalVector,
) => {
  const { x1, y1, x2, y2 } = vector;
  const maxY = Math.max(y1, y2);
  const minY = Math.min(y1, y2);
  const maxX = Math.max(x1, x2);
  const minX = Math.min(x1, x2);
  return (
    point.x >= minX && point.x <= maxX &&
    point.y >= minY && point.y <= maxY
  ) && isPointInLine(point, vector);
};

const getABCForLine = ({ x1, y1, x2, y2 }: GeometricalVector) => {
  const A = y2 - y1;
  const B = x1 - x2;
  const C = (A * x1) + (B * y1);
  return { A, B, C };
}

const getIntersectionPoint = (
  vector1: GeometricalVector,
  vector2: GeometricalVector,
) => {
  const { A: A1, B: B1, C: C1 } = getABCForLine(vector1);
  const { A: A2, B: B2, C: C2 } = getABCForLine(vector2);
  const det = A1 * B2 - A2 * B1;
  if (det == 0) {
    return undefined;
  } else {
    const x = (B2 * C1 - B1 * C2) / det;
    const y = (A1 * C2 - A2 * C1) / det;
    return { x, y };
  }
};

const segmentStyle = {
  stroke: 'white',
  strokeWidth: 3,
};

const extensionStyle = segmentStyle;

const parallelStyle = {
  stroke: 'red',
  strokeWidth: 3,
  strokeDasharray: '10, 5',
};;

const Angle = ({ boundingRect, vectors }: AngleProps) => {
  const [vector1, vector2] = vectors;

  const intersection = getIntersectionPoint(vector1, vector2);
  if (intersection === undefined) {
    return <g/>;
  } 

  const inVector1 = isPointInSegment(intersection, vector1);
  const inVector2 = isPointInSegment(intersection, vector2);
  if (inVector1 && inVector2) {
    return (
      <g>
        <line {...vector1} style={segmentStyle} />
        <line {...vector2} style={segmentStyle} />
      </g>
    );
  }

  const extendedVector2 = {
    x1: vector2.x1,
    y1: vector2.y1,
    x2: intersection.x,
    y2: intersection.y,
  }
  if (inVector1) {
    return (
      <g>
        <line {...vector1} style={segmentStyle} />
        <line {...extendedVector2} style={extensionStyle} />
        <line {...vector2} style={segmentStyle} />
      </g>
    );
  }

  const extendedVector1 = {
    x1: vector1.x1,
    y1: vector1.y1,
    x2: intersection.x,
    y2: intersection.y,
  }
  if (inVector2) {
    return (
      <g>
        <line {...extendedVector1} style={extensionStyle} />
        <line {...vector1} style={segmentStyle} />
        <line {...vector2} style={segmentStyle} />
      </g>
    );
  } else if (isPointWithinRect(intersection, boundingRect)) {
    return (
      <g>
        <line {...extendedVector1} style={extensionStyle} />
        <line {...vector1} style={segmentStyle} />
        <line {...extendedVector2} style={extensionStyle} />
        <line {...vector2} style={segmentStyle} />
      </g>
    );
  } else if (isPointCloserTo(intersection, vector1, vector2)) {
    // @TODO: create parallel to vector 2
    return <g />;
  } else {
    const { x1, y1 } = vector1;
    const slope = getSlope(vector1);
    const getY = (x: number) => slope * (x - x1) + y1;
    const x2 = boundingRect.right;
    const parallelToVector1 = {
      x1: intersection.x,
      y1: intersection.y,
      x2,
      y2: getY(x2),
    }
    return (
      <g>
        <line {...vector1} style={segmentStyle} />
        <line {...parallelToVector1} style={parallelStyle} />
        <line {...vector2} style={segmentStyle} />
      </g>
    );
  }
};

export default Angle;