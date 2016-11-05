import * as React from 'react';
import { pure } from 'recompose';

declare const require: __WebpackModuleApi.RequireFunction;

const classes = require('./style.scss');

interface VectorProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
};

const defaultProps = {
  stroke: 'white',
  strokeWidth: 3,
};

const Vector = pure((props: VectorProps) => {
  return (
    <line {...defaultProps} {...props} />
  );
});

export default Vector;
