import * as React from 'react';

import {
  isGeometricalPoint,
  isGeometricalVector,
  isGeometricalAngle,
} from 'utils/math';

import Angle, { AngleProps } from './Angle';

import { pure } from 'recompose';

import map from 'lodash/map';

import Props from './props';

export { AngleProps };
export type PointProps = React.SVGAttributes<SVGCircleElement>;
export type VectorProps = React.SVGAttributes<SVGLineElement>;

import memoize from 'lodash/memoize';

import { Rect } from 'utils/math';

const createBoundingRect = memoize((top: number, left: number, width: number, height: number): Rect => ({
  top, left,
  right: width,
  bottom: height,
}));


const GeoViewer = pure((props: Props) => {
  const {
    objects,
    top, left,
    width, height,
    getPropsForPoint,
    getPropsForVector,
    getPropsForAngle,
    style,
    children,
  } = props;
  return (
    <svg style={style}>
      {children}
      {
        map(objects, ({ value, symbol }) => {
          if (isGeometricalPoint(value)) {
            const rest = getPropsForPoint(symbol);
            return (
              <circle
                key={symbol}
                cx={value.x}
                cy={value.y}
                r={15}
                {...rest}
              />
            );
          } else if (isGeometricalVector(value)) {
            const rest = getPropsForVector(symbol);
            return (
              <line
                key={symbol}
                {...value}
                {...rest}
              />
            );
          } else if (isGeometricalAngle(value)) {
            const rest = getPropsForAngle(symbol);
            return (
              <Angle
                key={symbol}
                symbol={symbol}
                {...value}
                boundingRect={createBoundingRect(top, left, width, height)}
                {...rest}
              />
            );
          }
          return null;
        })
      }
    </svg>
  );
});

export default GeoViewer;
