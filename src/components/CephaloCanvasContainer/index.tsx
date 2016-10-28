import * as React from 'react';
import ResizeObservable from 'utils/resize-observable';
import CephaloCanvas from 'components/CephaloCanvas/connected';
import CephaloDropzone from 'components/CephaloDropzone/connected';
import Props from './props';
import { pure } from 'recompose';

const CephaloCanvasContainer = pure(({ hasImage, onResize }: Props) => {
  return (
    <ResizeObservable onResize={({ contentRect: { width, height } }) => onResize(width, height)}>
      {hasImage ? <CephaloCanvas /> : <CephaloDropzone />}
    </ResizeObservable>
  );
});

export default CephaloCanvasContainer;