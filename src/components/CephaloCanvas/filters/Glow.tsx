import * as React from 'react';
import { pure } from 'recompose';

const GlowFilter = pure(({ id, blur = 5, intensity = 0.7 }: { id: string, blur?: number, intensity?: number }) => (
  <filter id={id}>
    <feColorMatrix type="matrix" values={`0 0 0 0 0 0 0 1 1 1 0 0 0 0 0 0 0 0 ${intensity} 0`}/>
    <feGaussianBlur stdDeviation={blur} result="coloredBlur"/>
    <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
));

export default GlowFilter;
