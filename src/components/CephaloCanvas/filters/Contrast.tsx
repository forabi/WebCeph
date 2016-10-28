import * as React from 'react';
import { pure } from 'recompose';

const ContrastFilter = pure(({ id, value }: { id: string, value: number }) => {
  const c = 1 + (value / 100);
  const t = (1 - c) / 2;
  return (
    <filter id={id}>
      <feColorMatrix
        in="SourceGraphic" type="matrix"
        values={`
          ${c} 0    0    0  ${t}
          0    ${c} 0    0  ${t}
          0    0    ${c} 0  ${t}
          0    0    0    1  1
        `}
      />
    </filter>
  );
});

export default ContrastFilter;