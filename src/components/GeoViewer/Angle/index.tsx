import * as React from 'react';

import { pure } from 'recompose';

import reject from 'lodash/reject';
import isEqual from 'lodash/isEqual';
import last from 'lodash/last';
import uniqueId from 'lodash/uniqueId';

import {
  Rect,
  isPointInSegment,
  getIntersectionPoint,
  isPointWithinRect,
  getSlope,
  getVectorPoints,
} from 'utils/math';

const getParallelForVector = (
  vector1: GeometricalVector, origin: GeometricalPoint, tailX: number
): GeometricalVector => {
  const slope = getSlope(vector1);
  const intercept = origin.y - (slope * origin.x);
  const getY = (x: number) => (slope * x) + intercept;
  const x2 = tailX;
  return {
    x1: origin.x,
    y1: origin.y,
    x2,
    y2: getY(x2),
  };
}

export interface AngleProps {
  symbol: string;
  boundingRect: Rect;
  vectors: [GeometricalVector, GeometricalVector];
  extendedProps: React.SVGAttributes<SVGLineElement>;
  segmentProps: React.SVGAttributes<SVGLineElement>;
  parallelProps: React.SVGAttributes<SVGLineElement>;
  angleIndicatorProps: React.SVGAttributes<SVGCircleElement>
  rest?: React.SVGAttributes<SVGLineElement>;
}

interface ArcProps {
  vector1: GeometricalVector;
  vector2: GeometricalVector;
  props: React.SVGAttributes<SVGCircleElement>
}

  const Arc = ({ vector1, vector2, props }: ArcProps) => {
    const i = getIntersectionPoint(vector1, vector2);
    if (i !== undefined) {
      const { x, y } = i;
      const [point1, point2] = getVectorPoints(vector1);
      const [point3, point4] = getVectorPoints(vector2);
      const p1 = last(reject([point1, point2], p => isEqual(p, i)));
      const p2 = last(reject([point3, point4], p => isEqual(p, i)));
      const uid = uniqueId(`clip-path-`);
      const triangle = {
        points: [p1, i, p2].map(({ x, y }) => `${x},${y}`).join(' '),
      };
      return (
        <g>
          <clipPath id={uid}>
            <polygon {...triangle}/>
          </clipPath>
          <circle fill="none" clipPath={`url(#${uid})`} cx={x} cy={y} r={45} {...props} />
        </g>
      );
    }
    return <g/>;
  };

const Angle = pure((props: AngleProps): JSX.Element => {
  const {
    symbol,
    boundingRect,
    vectors,
    segmentProps,
    parallelProps,
    extendedProps,
    angleIndicatorProps,
    rest,
  } = props;
  const [vector1, vector2] = vectors;
  const intersection = getIntersectionPoint(vector1, vector2);
  if (intersection === undefined) {
    // console.info('The two vectors are parallel. No extension.');
    return <g/>;
  }

  const inSegment1 = isPointInSegment(intersection, vector1);
  const inSegment2 = isPointInSegment(intersection, vector2);
  const [head1, tail1] = getVectorPoints(vector1);
  const [head2, tail2] = getVectorPoints(vector2);
  console.log('Drawing angle %s...', symbol);
  let additionalElements: any[] = [];
  let finalVectors: [GeometricalVector, GeometricalVector];
  if (inSegment1 && inSegment2) { 
    if (isEqual(head1, head2) && isEqual(head1, intersection)) {
      console.info('Vectors are head to head, no need for extension.');
      finalVectors = vectors;
    } else if (isEqual(head1, tail2) || isEqual(head2, tail1)) {
      console.info('Vectors are head to tail');
      const extended2 = getParallelForVector(vector2, head1, head1.x + (head1.x - tail1.x));
      additionalElements = [
        <line key="extended2" {...extendedProps} {...rest} {...extended2} />,
      ];
      finalVectors = [vector1, extended2];
    } else if (inSegment1) {
      console.info('Extending vector2...');
      const extended1 = getParallelForVector(vector1, intersection, tail1.x);
      const extended2 = getParallelForVector(vector2, intersection, tail2.x);
      additionalElements = [
        <line key="extended2" {...extendedProps} {...rest} {...extended2} />,
      ];
      finalVectors = [extended1, extended2];
    } else {
      return <Angle {...props} vectors={[vector2, vector1]} />;
    }
  } else if (isPointWithinRect(intersection, boundingRect)) {
    console.info('Extending both vectors...');
    const extended1 = getParallelForVector(vector1, intersection, tail1.x);
    const extended2 = getParallelForVector(vector2, intersection, tail2.x);
    additionalElements = [
      <line key="extended1" {...extendedProps} {...rest} {...extended1} />,
      <line key="extended2" {...extendedProps} {...rest} {...extended2} />,
    ];
    finalVectors = [extended1, extended2];
  } else {
    // Intersection point is outside the canvas boundaries, create parallel
    console.log('Intersection point is outside the canvas boundaries, creating parallel...');
    const parallel = getParallelForVector(vector1, head2, tail1.x);
    additionalElements = [
      <line key="parallel1" {...parallelProps} {...rest} {...parallel} />,
    ];
    finalVectors = [parallel, vector2];
  }
  return (
    <g>
      <line {...segmentProps} {...rest} {...vector1} />
      <line {...segmentProps} {...rest} {...vector2} />
      {additionalElements}
      <Arc vector1={finalVectors[0]} vector2={finalVectors[1]} props={angleIndicatorProps} />
    </g>
  );
});

export default Angle;
