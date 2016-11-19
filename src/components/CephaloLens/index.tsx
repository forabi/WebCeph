import * as React from 'react';

import { pure } from 'recompose';

import Props from './props';

const lineStyle = {
  stroke: 'white',
  strokeWidth: 1,
};

const Lens = pure((props: Props) => {
  const {
    children,
    width, height,
    top, left,
    x = 0, y = 0,
    isFlippedX, isFlippedY,
    style: ownStyle = { },
  } = props;
  const transform = `translate(-${ x - (width / 2) }px, -${ y - (height / 2) }px)`;
  const style = {
    ...ownStyle,
    ...{
      top, left,
      width, height,
      position: 'absolute',
      overflow: 'hidden',
      transform: `scale(${ isFlippedX ? -1 : 1 }, ${ isFlippedY ? -1 : 1 })`,
    },
  };

  return (
    <div {...props} style={style}>
      <svg width={width} height={height}>
        <g style={{ transform }}>
          {children}
        </g>
        <line x1={width / 2} y1={0} x2={width / 2} y2={height} {...lineStyle} />
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} {...lineStyle} />
      </svg>
    </div>
  );
});

export default Lens;
