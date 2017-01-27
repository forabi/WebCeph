import React from 'react';

import { pure } from 'recompose';

import Props from './props';

const CephImage = pure((props: Props) => {
  const {
    src,
    width, height,
    isFlippedX = false,
    isFlippedY = false,
    ...rest,
  } = props;

  let transform = '';
  if (isFlippedX) {
    transform += ` scale(-1, 1) translate(-${width}, 0)`;
  }
  if (isFlippedY) {
    transform += ` scale(1, -1) translate(0, -${height})`;
  }

  return (
    <img
      src={src || undefined}
      {...rest}
    />
  );
});

export default CephImage;
