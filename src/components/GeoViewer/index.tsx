import * as React from 'react';

import {
  isGeometricalPoint,
  isGeometricalVector,
  isGeometricalAngle,
} from 'utils/math';

import Angle from './Angle';

import { pure } from 'recompose';

import map from 'lodash/map';

import Props from './props';

const GeoViewer = pure((props: Props) => {
  const {
    objects,
    top, left,
    width, height,
    getPropsForPoint,
    getPropsForVector,
    getPropsForAngle,
    style,
  } = props;
  return (
    <svg style={style}>
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
              {...value}
              boundingRect={{ top, left, right: width, bottom: height }}
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
