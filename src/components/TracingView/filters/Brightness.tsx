import * as React from 'react';
import { pure } from 'recompose';

const BrightnessFilter = pure(({ id, value }: { id: string, value: number }) => (
  <filter id={id}>
    <feComponentTransfer>
      <feFuncR type="linear" intercept={(value - 50) / 100} slope="1"/>
      <feFuncG type="linear" intercept={(value - 50) / 100} slope="1"/>
      <feFuncB type="linear" intercept={(value - 50) / 100} slope="1"/>
    </feComponentTransfer>
  </filter>
));

export default BrightnessFilter;