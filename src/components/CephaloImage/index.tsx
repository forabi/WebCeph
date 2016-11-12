import * as React from 'react';

import { pure } from 'recompose';

import Props from './props';

const Lens = pure((props: Props) => {
  const {
    src,
    width, height,
    isFlippedX = false, isFlippedY = false,
    children,
  } = props;

  let transform = '';
  if (isFlippedX) {
    transform += ` scale(-1, 1) translate(-${width}, 0)`;
  }
  if (isFlippedY) {
    transform += ` scale(1, -1) translate(0, -${height})`;
  }

  return (
    <svg width={width || 0} height={height || 0}>
      <image
        xlinkHref={src || undefined}
        x={0}
        y={0}
        width={width || 0}
        height={height || 0}
        transform={transform}
      />
      {children}
    </svg>
  );
});

export default Lens;
