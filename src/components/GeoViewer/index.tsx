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

const classes = require('./style.scss');

const segmentProps = {
  className: classes.angle_segment,
};

const parallelProps = {
  className: classes.line_parallel,
};

const extendedProps = {
  className: classes.line_extended + ' ' + classes.highlighted,
};

const GeoViewer = pure(({ objects, top, left, width, height }: Props) => {
  return (
    <svg>
    {
      map(objects, ({ value, symbol }) => {
        if (isGeometricalPoint(value)) {
          return (
            <circle
              key={symbol}
              className={classes.point}
              cx={value.x}
              cy={value.y}
              r={15}
            />
          );
        } else if (isGeometricalVector(value)) {
          return (
            <line
              key={symbol}
              className={classes.line}
              {...value}
            />
          );
        } else if (isGeometricalAngle(value)) {
          return (
            <Angle
              key={symbol}
              rest={{ className: classes.angle }}
              {...value}
              boundingRect={{ top, left, right: width, bottom: height }}
              segmentProps={segmentProps}
              extendedProps={extendedProps}
              parallelProps={parallelProps}
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
