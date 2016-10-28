import * as React from 'react';
import { pure } from 'recompose';

const InvertFilter = pure(({ id }: { id: string }) => (
  <filter id={id}>
    <feColorMatrix
      in="SourceGraphic" type="matrix"
      values={`
        -1  0  0  0 1
         0 -1  0  0 1
         0  0 -1  0 1
         1  1  1 0  1
      `}
    />
  </filter>
));

export default InvertFilter;