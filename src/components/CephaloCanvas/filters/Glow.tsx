import * as React from 'react';
import { pure } from 'recompose';

const GlowFilter = pure(({ id }: { id: string }) => (
  <filter id={id}>
    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.7 0"/>
    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
    <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
));

export default GlowFilter;
